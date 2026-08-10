import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";
import { UserRole, Prisma, MaterialUnit, type ProductionStatus } from "@prisma/client";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateInput } from "@/lib/validation";
import { logAuditAction, AUDIT_ACTIONS } from "@/lib/audit-log";
import { getCompatibleMaterials } from "@/modules/materials/server";
import {
  calculateOutsourceFinancials,
  canTransitionProductionStatus,
  MachineReservationError,
  reserveMachineAtomically,
} from "@/lib/production/job-rules";
import {
  calculateMaterialUsage,
  MaterialConsumptionError,
  type MaterialForConsumption,
} from "@/modules/materials/materialConsumption";
import { z } from "zod";

const updateProductionJobSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  machineId: z.string().optional().nullable(),
  printMethodId: z.string().optional().nullable(),
  materialId: z.string().optional().nullable(),
});

// Job-uri în status terminal → mașina trebuie eliberată
const TERMINAL_STATUSES = ["COMPLETED", "CANCELED"] as const;

// GET /api/admin/production/[id] - Get single production job
export const GET = withRole(
  [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  async (request: NextRequest, { params, user: _user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;

      const job = await prisma.productionJob.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              printMethodId: true,
              materialId: true,
              isOutsourced: true,
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
          order: {
            include: {
              orderItems: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    },
                  },
                },
              },
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (!job) {
        return NextResponse.json({ error: "Production job not found" }, { status: 404 });
      }

      return NextResponse.json(job);
    } catch (error) {
      console.error("Error fetching production job:", error);
      return NextResponse.json(
        { error: "Failed to fetch production job" },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/admin/production/[id] - Update production job
export const PATCH = withRole(
  [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;
      const body = await request.json();

      // Validate input
      const validation = await validateInput(updateProductionJobSchema, body);
      if (!validation.success) {
        return NextResponse.json({ errors: validation.errors }, { status: 400 });
      }

      const { name, status, priority, dueDate, notes, assignedToId, printMethodId, materialId } = validation.data;

      // Check if job exists and get old data for audit
      const existingJob = await prisma.productionJob.findUnique({
        where: { id },
        select: {
          orderId: true,
          productId: true,
          status: true,
          priority: true,
          assignedToId: true,
          machineId: true,
          printMethodId: true,
          materialId: true,
          startedAt: true,
          completedAt: true,
          quantity: true,
        },
      });

      if (!existingJob) {
        return NextResponse.json({ error: "Production job not found" }, { status: 404 });
      }

      if (
        status !== undefined &&
        status !== existingJob.status &&
        !canTransitionProductionStatus(existingJob.status as ProductionStatus, status)
      ) {
        return NextResponse.json(
          {
            error: `Invalid status transition: ${existingJob.status} -> ${status}`,
          },
          { status: 400 }
        );
      }

    // If assignedToId is being changed, validate user
    if (assignedToId !== undefined) {
      if (assignedToId) {
        const user = await prisma.user.findUnique({
          where: { id: assignedToId },
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
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const { machineId: newMachineId } = validation.data;
    const effectiveMachineId = newMachineId !== undefined ? (newMachineId || null) : existingJob.machineId;
    const effectivePrintMethodId = printMethodId !== undefined ? (printMethodId || null) : existingJob.printMethodId;
    const effectiveMaterialId = materialId !== undefined ? (materialId || null) : existingJob.materialId;
    let effectivePrintMethodIsOutsourced = false;
    let effectiveOutsourceCostPerM2 = 0;
    let effectiveOutsourceCostPerUnit = 0;
    let effectiveOutsourceMarkup = 0;

    if (name !== undefined) updateData.name = name.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
    if (validation.data.productId !== undefined) updateData.productId = validation.data.productId || null;
    if (newMachineId !== undefined) updateData.machineId = newMachineId || null;
    if (printMethodId !== undefined) updateData.printMethodId = printMethodId || null;
    if (materialId !== undefined) updateData.materialId = materialId || null;

    // Handle status transitions
    if (status) {
      if (status === "IN_PROGRESS" && !existingJob.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === "COMPLETED" && !existingJob.completedAt) {
        updateData.completedAt = new Date();
      }
      if (status !== "COMPLETED" && existingJob.status === "COMPLETED") {
        updateData.completedAt = null;
      }
    }

    // ── Machine status transitions ──────────────────────────────────
    // 1. Status → terminal (COMPLETED/CANCELED) → free old machine
    // 2. machineId change → free old, validate & set new to BUSY
    const isBecomingTerminal =
      status !== undefined &&
      (TERMINAL_STATUSES as readonly string[]).includes(status) &&
      !(TERMINAL_STATUSES as readonly string[]).includes(existingJob.status);

    const isMachineBeingChanged =
      newMachineId !== undefined && newMachineId !== existingJob.machineId;

    const isMachineBeingSet = isMachineBeingChanged && !!newMachineId;
    const shouldValidateCurrentCompatibility =
      !isBecomingTerminal && (printMethodId !== undefined || materialId !== undefined || isMachineBeingSet);

    if (printMethodId !== undefined && printMethodId) {
      const printMethod = await prisma.printMethod.findUnique({
        where: { id: printMethodId },
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

      effectivePrintMethodIsOutsourced = printMethod.isOutsourced;
      effectiveOutsourceCostPerM2 = printMethod.costFurnizorPerM2 ? Number(printMethod.costFurnizorPerM2) : 0;
      effectiveOutsourceCostPerUnit = printMethod.costFurnizorPerUnit ? Number(printMethod.costFurnizorPerUnit) : 0;
      effectiveOutsourceMarkup = printMethod.markup ? Number(printMethod.markup) : 0;
    }

    if (effectivePrintMethodId && printMethodId === undefined) {
      const currentMethod = await prisma.printMethod.findUnique({
        where: { id: effectivePrintMethodId },
        select: {
          isOutsourced: true,
          costFurnizorPerM2: true,
          costFurnizorPerUnit: true,
          markup: true,
        },
      });
      effectivePrintMethodIsOutsourced = Boolean(currentMethod?.isOutsourced);
      effectiveOutsourceCostPerM2 = currentMethod?.costFurnizorPerM2 ? Number(currentMethod.costFurnizorPerM2) : 0;
      effectiveOutsourceCostPerUnit = currentMethod?.costFurnizorPerUnit ? Number(currentMethod.costFurnizorPerUnit) : 0;
      effectiveOutsourceMarkup = currentMethod?.markup ? Number(currentMethod.markup) : 0;
    }

    if (effectivePrintMethodIsOutsourced) {
      updateData.machineId = null;
      updateData.materialId = null;

      const qty = existingJob.quantity ? Number(existingJob.quantity) : 0;
      if (qty > 0) {
        const outsourceValues = calculateOutsourceFinancials({
          quantity: qty,
          supplierCostPerM2: effectiveOutsourceCostPerM2,
          supplierCostPerUnit: effectiveOutsourceCostPerUnit,
          markupPercent: effectiveOutsourceMarkup,
        });
        updateData.estimatedCost = outsourceValues.estimatedCost;
        updateData.outsourcedCost = outsourceValues.outsourcedCost;
        updateData.outsourcedProfit = outsourceValues.outsourcedProfit;
      }
    }

    // Validate new machine before entering transaction
    if (isMachineBeingSet && !isBecomingTerminal && !effectivePrintMethodIsOutsourced) {
      const newMachine = await prisma.machine.findUnique({
        where: { id: newMachineId as string },
        select: {
          status: true,
          active: true,
          name: true,
          compatiblePrintMethodIds: true,
        },
      });
      if (!newMachine) {
        return NextResponse.json({ error: "Machine not found" }, { status: 404 });
      }
      if (!newMachine.active) {
        return NextResponse.json(
          { error: `Echipamentul "${newMachine.name}" este inactiv` },
          { status: 409 }
        );
      }

      const newMachineCompatibleMethodIds = (newMachine.compatiblePrintMethodIds ?? []) as string[];

      if (effectivePrintMethodId && !newMachineCompatibleMethodIds.includes(effectivePrintMethodId)) {
        return NextResponse.json(
          { error: `Echipamentul "${newMachine.name}" nu suportă metoda de tipărire selectată` },
          { status: 400 }
        );
      }
    }

    if (shouldValidateCurrentCompatibility && effectiveMachineId && !isMachineBeingSet && !effectivePrintMethodIsOutsourced) {
      const currentMachine = await prisma.machine.findUnique({
        where: { id: effectiveMachineId },
        select: {
          name: true,
          compatiblePrintMethodIds: true,
        },
      });

      if (!currentMachine) {
        return NextResponse.json({ error: "Machine not found" }, { status: 404 });
      }

      const currentMachineCompatibleMethodIds = (currentMachine.compatiblePrintMethodIds ?? []) as string[];

      if (effectivePrintMethodId && !currentMachineCompatibleMethodIds.includes(effectivePrintMethodId)) {
        return NextResponse.json(
          { error: `Echipamentul "${currentMachine.name}" nu suportă metoda de tipărire selectată` },
          { status: 400 }
        );
      }
    }

    if (shouldValidateCurrentCompatibility && effectiveMaterialId && !effectivePrintMethodIsOutsourced) {
      const compatibleMaterials = await getCompatibleMaterials({
        printMethodId: effectivePrintMethodId || undefined,
        equipmentId: effectiveMachineId || undefined,
      });

      const selectedMaterial = compatibleMaterials.find((material) => material.id === effectiveMaterialId);
      if (!selectedMaterial) {
        return NextResponse.json(
          { error: "Materialul selectat nu este compatibil cu metoda și echipamentul alese" },
          { status: 400 }
        );
      }
    }

    // ── Material consumption at COMPLETED ──────────────────────────────────
    // Pre-calculate before transaction so we can return errors without rolling back.
    const isBecomingCompleted = isBecomingTerminal && status === "COMPLETED";
    let consumptionResult: ReturnType<typeof calculateMaterialUsage> | null = null;
    let consumptionMaterial: (MaterialForConsumption & { stock: number }) | null = null;

    if (isBecomingCompleted && effectiveMaterialId && !effectivePrintMethodIsOutsourced) {
      const mat = await prisma.material.findUnique({
        where: { id: effectiveMaterialId },
        select: {
          id: true,
          name: true,
          active: true,
          consumptionType: true,
          unit: true,
          wastePercent: true,
          pricePerSqm: true,
          pricePerMeter: true,
          pricePerUnit: true,
          stock: true,
        },
      });

      if (!mat) {
        return NextResponse.json({ error: "Material not found" }, { status: 404 });
      }

      // Skip if usage was already recorded (e.g. job re-completed after reversal)
      const existingUsage = await prisma.materialUsage.findFirst({
        where: { jobId: id },
        select: { id: true },
      });

      if (!existingUsage) {
        try {
          consumptionResult = calculateMaterialUsage(
            { id, quantity: existingJob.quantity ? Number(existingJob.quantity) : null },
            mat
          );
          consumptionMaterial = mat;
        } catch (err) {
          if (err instanceof MaterialConsumptionError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
          }
          throw err;
        }
      }
    }

      // Update job + machine status in transaction
      const updatedJob = await prisma.$transaction(async (tx) => {
        // Free old machine if status → terminal OR machine is being removed/changed
        if (existingJob.machineId && (isBecomingTerminal || isMachineBeingChanged || effectivePrintMethodIsOutsourced)) {
          await tx.machine.update({
            where: { id: existingJob.machineId },
            data: { status: "AVAILABLE" },
          });
        }

        // Set new machine to BUSY (only if not becoming terminal)
        if (isMachineBeingSet && !isBecomingTerminal && !effectivePrintMethodIsOutsourced) {
          await reserveMachineAtomically(tx, newMachineId as string);
        }

        const updatedJobData = await tx.productionJob.update({
          where: { id },
          data: updateData,
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

        // Create MaterialUsage record and deduct stock if transitioning to COMPLETED
        if (consumptionResult && consumptionMaterial) {
          await tx.materialUsage.create({
            data: {
              materialId: consumptionMaterial.id,
              jobId: id,
              quantity: consumptionResult.quantity,
              unit: consumptionResult.usageUnit,
              wastePercent: consumptionResult.wastePercent,
              totalUsed: consumptionResult.totalUsed,
              cost: new Prisma.Decimal(consumptionResult.totalCost),
            },
          });

          // Deduct consumed material from stock (can go below 0 — tracked but not blocked)
          await tx.material.update({
            where: { id: consumptionMaterial.id },
            data: { stock: { decrement: consumptionResult.totalUsed } },
          });
        }

        // ── Equipment Consumables Consumption ──────────────────────────────────
        // When job completes, automatically consume equipment consumables (ink, toner, powder, etc.)
        if (isBecomingCompleted && effectiveMachineId && existingJob.quantity && !effectivePrintMethodIsOutsourced) {
          const machine = await tx.machine.findUnique({
            where: { id: effectiveMachineId },
            select: {
              equipmentType: true,
              consumables: {
                where: { active: true },
                include: {
                  material: {
                    select: {
                      id: true,
                      name: true,
                      unit: true,
                      stock: true,
                      pricePerUnit: true,
                    },
                  },
                },
              },
            },
          });

          const machineConsumables = (machine?.consumables ?? []) as Array<{
            materialId: string;
            consumptionPerSqm: Prisma.Decimal | null;
            consumptionPerUnit: Prisma.Decimal | null;
            consumptionPerJob: Prisma.Decimal | null;
            unit: string;
            material: {
              pricePerUnit: Prisma.Decimal | null;
            };
          }>;

          if (machine && machineConsumables.length > 0) {
            const jobQuantity = Number(existingJob.quantity);

            for (const consumable of machineConsumables) {
              let consumedAmount = 0;

              // Calculate consumption based on equipment type and consumable config
              if (consumable.consumptionPerSqm && machine.equipmentType === 'LARGE_FORMAT') {
                // For Large Format: consumption per m²
                consumedAmount = Number(consumable.consumptionPerSqm) * jobQuantity;
              } else if (consumable.consumptionPerUnit && machine.equipmentType === 'DIGITAL') {
                // For Digital: consumption per click/page
                consumedAmount = Number(consumable.consumptionPerUnit) * jobQuantity;
              }

              // Add fixed consumption per job if configured
              if (consumable.consumptionPerJob) {
                consumedAmount += Number(consumable.consumptionPerJob);
              }

              // Skip if no consumption calculated
              if (consumedAmount <= 0) continue;

              // Calculate cost based on material's pricePerUnit
              const unitPrice = consumable.material.pricePerUnit 
                ? Number(consumable.material.pricePerUnit) 
                : 0;
              const totalCost = consumedAmount * unitPrice;

              // Create MaterialUsage record for the consumable
              await tx.materialUsage.create({
                data: {
                  materialId: consumable.materialId,
                  jobId: id,
                  quantity: consumedAmount,
                  unit: consumable.unit as MaterialUnit,
                  wastePercent: 0, // Consumables typically don't have waste
                  totalUsed: consumedAmount,
                  cost: new Prisma.Decimal(totalCost),
                },
              });

              // Deduct consumed amount from stock
              await tx.material.update({
                where: { id: consumable.materialId },
                data: { stock: { decrement: consumedAmount } },
              });
            }
          }
        }

        // ── Print Method Indirect Consumables ──────────────────────────────────
        // When job completes, consume indirect consumables from the print method
        if (isBecomingCompleted && effectivePrintMethodId && existingJob.quantity && !effectivePrintMethodIsOutsourced) {
          const printMethodConsumableDelegate = (tx as typeof tx & {
            printMethodConsumable: {
              findMany: (args: {
                where: { printMethodId: string; active: true };
                include: {
                  material: {
                    select: {
                      id: true;
                      name: true;
                      unit: true;
                      stock: true;
                      pricePerUnit: true;
                    };
                  };
                };
              }) => Promise<Array<{
                materialId: string;
                costPerSqm: Prisma.Decimal | null;
                costPerJob: Prisma.Decimal | null;
                material: {
                  unit: string;
                };
              }>>;
            };
          }).printMethodConsumable;

          const methodConsumables = await printMethodConsumableDelegate.findMany({
            where: {
              printMethodId: effectivePrintMethodId,
              active: true,
            },
            include: {
              material: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  stock: true,
                  pricePerUnit: true,
                },
              },
            },
          });

          if (methodConsumables.length > 0) {
            const jobQuantity = Number(existingJob.quantity);

            for (const consumable of methodConsumables) {
              let totalCost = 0;

              // Calculate cost based on print method consumable configuration
              if (consumable.costPerSqm) {
                totalCost += Number(consumable.costPerSqm) * jobQuantity;
              }
              if (consumable.costPerJob) {
                totalCost += Number(consumable.costPerJob);
              }

              // Skip if no cost calculated
              if (totalCost <= 0) continue;

              // For indirect consumables, we don't track physical quantity consumed
              // We only record the cost impact on the job
              // Use a nominal quantity of 1 to represent "consumed for this job"
              await tx.materialUsage.create({
                data: {
                  materialId: consumable.materialId,
                  jobId: id,
                  quantity: 1, // Nominal quantity (cost-based, not physical)
                  unit: consumable.material.unit as MaterialUnit,
                  wastePercent: 0,
                  totalUsed: 1,
                  cost: new Prisma.Decimal(totalCost),
                },
              });

              // Note: We don't deduct from stock for indirect consumables
              // as they represent technological costs, not physical material consumption
            }
          }
        }

        return updatedJobData;
      });


      // Audit log for status changes
      if (status && status !== existingJob.status) {
        await logAuditAction({
          userId: user.id,
          action: AUDIT_ACTIONS.PRODUCTION_STATUS_CHANGE,
          resourceType: 'production_job',
          resourceId: id,
          details: {
            oldStatus: existingJob.status,
            newStatus: status,
          },
        });
      }

      return NextResponse.json(updatedJob);
    } catch (error) {
      if (error instanceof MachineReservationError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }
      console.error("Error updating production job:", error);
      return NextResponse.json(
        { error: "Failed to update production job" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/production/[id] - Delete production job
export const DELETE = withRole(
  [UserRole.ADMIN, UserRole.MANAGER],
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;

      // Check if job exists
      const job = await prisma.productionJob.findUnique({
        where: { id },
        select: {
          status: true,
          name: true,
          machineId: true,
        },
      });

      if (!job) {
        return NextResponse.json({ error: "Production job not found" }, { status: 404 });
      }

      // Check if job can be deleted (not IN_PROGRESS or COMPLETED)
      if (job.status === "IN_PROGRESS" || job.status === "COMPLETED") {
        return NextResponse.json(
          { error: `Cannot delete job with status ${job.status}` },
          { status: 400 }
        );
      }

      // Delete job + free machine in transaction
      await prisma.$transaction(async (tx) => {
        await tx.productionJob.delete({ where: { id } });

        // Eliberează mașina dacă era alocată
        if (job.machineId) {
          await tx.machine.update({
            where: { id: job.machineId },
            data: { status: "AVAILABLE" },
          });
        }
      });

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.PRODUCTION_DELETE,
        resourceType: 'production_job',
        resourceId: id,
        details: {
          name: job.name,
          status: job.status,
        },
      });

      return NextResponse.json({ message: "Production job deleted successfully" });
    } catch (error) {
      console.error("Error deleting production job:", error);
      return NextResponse.json(
        { error: "Failed to delete production job" },
        { status: 500 }
      );
    }
  }
);
