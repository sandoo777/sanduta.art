import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { calculateProductionTime, calculateProductionCost, type EquipmentTypeForCalc } from "@/lib/production-time";
import { getCompatibleMaterials } from "@/modules/materials/server";

// GET /api/admin/production - List production jobs with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const orderId = searchParams.get("orderId");
    const printMethodId = searchParams.get("printMethodId");
    const materialId = searchParams.get("materialId");

    // Build filter object
    const where: Parameters<typeof prisma.productionJob.findMany>[0]['where'] = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (orderId) where.orderId = orderId;
    if (printMethodId) where.printMethodId = printMethodId;
    if (materialId) where.materialId = materialId;

    const jobs = await prisma.productionJob.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            totalPrice: true,
            status: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            printMethodId: true,
            materialId: true,
            isOutsourced: true,
            saleUnit: true,
            pricePerM2: true,
            pricePerUnit: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            id: true,
            name: true,
            type: true,
            equipmentType: true,
            status: true,
          },
        },
        printMethod: {
          select: {
            id: true,
            name: true,
            type: true,
            isOutsourced: true,
            termenFurnizor: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching production jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch production jobs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/production - Create production job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      orderId,
      productId,
      name,
      priority,
      dueDate,
      deadline,
      notes,
      assignedToId,
      assignedTo,
      machineId,
      printMethodId,
      materialId,
      quantity,
      bwPages,
    } = body;

    // Validations
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const resolvedAssignedToId = assignedToId || assignedTo || null;

    // If assignedToId is provided, validate user exists and has correct role
    if (resolvedAssignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: resolvedAssignedToId },
      });

      if (!user) {
        return NextResponse.json({ error: "Assigned user not found" }, { status: 404 });
      }

      if (!["MANAGER", "OPERATOR"].includes(user.role)) {
        return NextResponse.json(
          { error: "Assigned user must be MANAGER or OPERATOR" },
          { status: 400 }
        );
      }
    }

    let resolvedPrintMethodId: string | null = printMethodId || null;
    let resolvedMaterialId: string | null = materialId || null;

    let selectedProduct: {
      id: string;
      printMethodId: string | null;
      materialId: string | null;
      isOutsourced: boolean;
      saleUnit: 'M2' | 'UNIT';
      pricePerM2: number | null;
      pricePerUnit: number | null;
      pricing: unknown;
      active: boolean;
    } | null = null;

    if (productId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: { orderId, productId },
        select: { id: true },
      });

      if (!orderItem) {
        return NextResponse.json({ error: "Produsul selectat nu aparține comenzii" }, { status: 400 });
      }

      selectedProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          printMethodId: true,
          materialId: true,
          isOutsourced: true,
          saleUnit: true,
          pricePerM2: true,
          pricePerUnit: true,
          pricing: true,
          active: true,
        },
      });

      if (selectedProduct) {
        if (!selectedProduct.active) {
          return NextResponse.json({ error: 'Product is inactive' }, { status: 400 });
        }

        if (!resolvedPrintMethodId && selectedProduct.printMethodId) {
          resolvedPrintMethodId = selectedProduct.printMethodId;
        }
        if (!resolvedMaterialId && !selectedProduct.isOutsourced && selectedProduct.materialId) {
          resolvedMaterialId = selectedProduct.materialId;
        }
      }
    }

    let selectedPrintMethod: {
      id: string;
      name: string;
      active: boolean;
      isOutsourced: boolean;
      costFurnizorPerM2: number | null;
      costFurnizorPerUnit: number | null;
      markup: number | null;
    } | null = null;

    if (resolvedPrintMethodId) {
      const printMethod = await prisma.printMethod.findUnique({
        where: { id: resolvedPrintMethodId },
        select: {
          id: true,
          name: true,
          active: true,
          isOutsourced: true,
          costFurnizorPerM2: true,
          costFurnizorPerUnit: true,
          markup: true,
        },
      });

      if (!printMethod) {
        return NextResponse.json({ error: "Print method not found" }, { status: 404 });
      }

      if (!printMethod.active) {
        return NextResponse.json(
          { error: `Metoda de tipărire "${printMethod.name}" este inactivă` },
          { status: 409 }
        );
      }

      selectedPrintMethod = {
        id: printMethod.id,
        name: printMethod.name,
        active: printMethod.active,
        isOutsourced: printMethod.isOutsourced,
        costFurnizorPerM2: printMethod.costFurnizorPerM2 ? Number(printMethod.costFurnizorPerM2) : null,
        costFurnizorPerUnit: printMethod.costFurnizorPerUnit ? Number(printMethod.costFurnizorPerUnit) : null,
        markup: printMethod.markup ? Number(printMethod.markup) : null,
      };
    }

    // Validate machine + fetch data needed for time+cost calculation (one query)
    let machineCalcData: {
      name: string;
      equipmentType: EquipmentTypeForCalc;
      speedM2PerHour: number | null;
      speedPpm: number | null;
      // cost fields
      inkPerM2: number | null;
      materialPerM2: number | null;
      headAmortPerM2: number | null;
      printerAmortPerM2: number | null;
      maintCostPerM2: number | null;
      costClickColor: number | null;
      costClickBW: number | null;
      costPerHour: number | null;
    } | null = null;

    if (machineId && !selectedPrintMethod?.isOutsourced) {
      const machine = await prisma.machine.findUnique({
        where: { id: machineId },
        select: {
          status: true,
          active: true,
          name: true,
          equipmentType: true,
          compatibleMaterialIds: true,
          compatiblePrintMethodIds: true,
          speedM2PerHour: true,
          speedPpm: true,
          inkPerM2: true,
          materialPerM2: true,
          headAmortPerM2: true,
          printerAmortPerM2: true,
          maintCostPerM2: true,
          costClickColor: true,
          costClickBW: true,
          costPerHour: true,
        },
      });

      if (!machine) {
        return NextResponse.json({ error: "Machine not found" }, { status: 404 });
      }
      if (!machine.active) {
        return NextResponse.json({ error: `Echipamentul "${machine.name}" este inactiv` }, { status: 409 });
      }
      if (machine.status === "BUSY") {
        return NextResponse.json(
          { error: `Echipamentul "${machine.name}" este deja ocupat de alt job` },
          { status: 409 }
        );
      }
      if (machine.status === "MAINTENANCE") {
        return NextResponse.json(
          { error: `Echipamentul "${machine.name}" este în mentenanță` },
          { status: 409 }
        );
      }

      if (resolvedPrintMethodId && !machine.compatiblePrintMethodIds.includes(resolvedPrintMethodId)) {
        return NextResponse.json(
          { error: `Echipamentul "${machine.name}" nu suportă metoda de tipărire selectată` },
          { status: 400 }
        );
      }

      machineCalcData = {
        name: machine.name,
        equipmentType: machine.equipmentType as EquipmentTypeForCalc,
        speedM2PerHour: machine.speedM2PerHour ? Number(machine.speedM2PerHour) : null,
        speedPpm: machine.speedPpm ?? null,
        inkPerM2:          machine.inkPerM2          ? Number(machine.inkPerM2)          : null,
        materialPerM2:     machine.materialPerM2     ? Number(machine.materialPerM2)     : null,
        headAmortPerM2:    machine.headAmortPerM2    ? Number(machine.headAmortPerM2)    : null,
        printerAmortPerM2: machine.printerAmortPerM2 ? Number(machine.printerAmortPerM2) : null,
        maintCostPerM2:    machine.maintCostPerM2    ? Number(machine.maintCostPerM2)    : null,
        costClickColor:    machine.costClickColor    ? Number(machine.costClickColor)    : null,
        costClickBW:       machine.costClickBW       ? Number(machine.costClickBW)       : null,
        costPerHour:       machine.costPerHour       ? Number(machine.costPerHour)       : null,
      };
    }

    if (resolvedMaterialId && !selectedPrintMethod?.isOutsourced) {
      const materials = await getCompatibleMaterials({
        printMethodId: resolvedPrintMethodId || undefined,
        equipmentId: machineId || undefined,
      });

      const selectedMaterial = materials.find((material) => material.id === resolvedMaterialId);
      if (!selectedMaterial) {
        return NextResponse.json(
          { error: "Materialul selectat nu este compatibil cu metoda și echipamentul alese" },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    // Calculate estimated production time if machine + quantity provided
    let estimatedMinutes: number | null = null;
    let estimatedCost: number | null = null;
    const parsedQuantity = quantity != null && quantity !== '' ? Number(quantity) : null;
    const parsedBwPages  = bwPages  != null && bwPages  !== '' ? Number(bwPages)  : null;

    let outsourcedCost: number | null = null;
    let outsourcedProfit: number | null = null;

    if (selectedPrintMethod?.isOutsourced && parsedQuantity !== null && parsedQuantity > 0) {
      const productPricing = (selectedProduct?.pricing ?? null) as Record<string, unknown> | null;
      const supplierPerUnit = typeof productPricing?.supplierCost === 'number'
        ? Number(productPricing.supplierCost)
        : 0;
      const markupPercent = typeof productPricing?.markup === 'number'
        ? Number(productPricing.markup)
        : Number(selectedPrintMethod.markup ?? 0);
      const supplierCost = supplierPerUnit * parsedQuantity;
      const markupValue = supplierCost * (markupPercent / 100);
      estimatedCost = supplierCost;
      outsourcedCost = supplierCost;
      outsourcedProfit = markupValue;
    } else if (machineCalcData && parsedQuantity !== null && parsedQuantity > 0) {
      try {
        const timeResult = calculateProductionTime(
          { id: machineId, ...machineCalcData },
          { quantity: parsedQuantity },
        );
        estimatedMinutes = timeResult.estimatedMinutes;
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Calcul timp eșuat' },
          { status: 400 }
        );
      }

      try {
        const costResult = calculateProductionCost(
          { id: machineId, ...machineCalcData },
          { quantity: parsedQuantity, bwPages: parsedBwPages ?? 0 },
        );
        estimatedCost = costResult.estimatedCost;

        // Add indirect consumables cost from print method
        if (resolvedPrintMethodId) {
          const methodConsumables = await prisma.printMethodConsumable.findMany({
            where: { 
              printMethodId: resolvedPrintMethodId,
              active: true,
            },
            select: {
              costPerSqm: true,
              costPerJob: true,
            },
          });

          let consumablesCost = 0;
          for (const consumable of methodConsumables) {
            if (consumable.costPerSqm) {
              consumablesCost += Number(consumable.costPerSqm) * parsedQuantity;
            }
            if (consumable.costPerJob) {
              consumablesCost += Number(consumable.costPerJob);
            }
          }

          if (consumablesCost > 0) {
            estimatedCost += consumablesCost;
          }
        }
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Calcul cost eșuat' },
          { status: 400 }
        );
      }
    }

    // Create production job + set machine BUSY in one transaction
    const job = await prisma.$transaction(async (tx) => {
      const resolvedMachineId = selectedPrintMethod?.isOutsourced ? null : (machineId || null);
      const finalMaterialId = selectedPrintMethod?.isOutsourced ? null : resolvedMaterialId;

      const newJob = await tx.productionJob.create({
        data: {
          orderId,
          productId: productId || null,
          name: name.trim(),
          priority: priority || "NORMAL",
          dueDate: (dueDate || deadline) ? new Date(dueDate || deadline) : null,
          notes: notes?.trim() || null,
          assignedToId: resolvedAssignedToId,
          machineId: resolvedMachineId,
          printMethodId: resolvedPrintMethodId,
          materialId: finalMaterialId,
          quantity: parsedQuantity !== null ? parsedQuantity : null,
          bwPages:  parsedBwPages  !== null ? parsedBwPages  : null,
          estimatedMinutes,
          estimatedCost,
          outsourcedCost,
          outsourcedProfit,
          status: "PENDING",
        },
        include: {
          order: {
            select: {
              id: true,
              customerName: true,
              totalPrice: true,
              status: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              printMethodId: true,
              materialId: true,
              isOutsourced: true,
              saleUnit: true,
              pricePerM2: true,
              pricePerUnit: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          machine: {
            select: {
              id: true,
              name: true,
              type: true,
              equipmentType: true,
              status: true,
            },
          },
          printMethod: {
            select: {
              id: true,
              name: true,
              type: true,
              isOutsourced: true,
              termenFurnizor: true,
            },
          },
          material: {
            select: {
              id: true,
              name: true,
              unit: true,
              category: true,
            },
          },
        },
      });

      if (resolvedMachineId) {
        await tx.machine.update({
          where: { id: resolvedMachineId },
          data: { status: "BUSY" },
        });
      }

      return newJob;
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating production job:", error);
    return NextResponse.json(
      { error: "Failed to create production job" },
      { status: 500 }
    );
  }
}
