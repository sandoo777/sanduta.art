import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/materials
 * List all materials with low stock indicators and total consumption
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const materials = await prisma.material.findMany({
      include: {
        consumption: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate low stock and total consumption for each material
    const materialsWithMetrics = materials.map((material) => {
      const totalConsumption = material.consumption.reduce(
        (sum, usage) => sum + usage.quantity,
        0
      );

      return {
        id: material.id,
        name: material.name,
        sku: material.sku,
        unit: material.unit,
        stock: material.stock,
        minStock: material.minStock,
        costPerUnit: material.costPerUnit,
        notes: material.notes,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
        lowStock: material.stock < material.minStock,
        totalConsumption,
      };
    });

    return NextResponse.json(materialsWithMetrics);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Eroare la preluarea materialelor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/materials
 * Create a new material
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const body = await request.json();
    const { name, sku, unit, stock, minStock, costPerUnit, notes } = body;

    // Validations
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Numele materialului este obligatoriu" },
        { status: 400 }
      );
    }

    if (!unit || typeof unit !== "string" || unit.trim() === "") {
      return NextResponse.json(
        { error: "Unitatea de măsură este obligatorie" },
        { status: 400 }
      );
    }

    if (stock !== undefined && (typeof stock !== "number" || stock < 0)) {
      return NextResponse.json(
        { error: "Stocul trebuie să fie un număr pozitiv" },
        { status: 400 }
      );
    }

    if (minStock !== undefined && (typeof minStock !== "number" || minStock < 0)) {
      return NextResponse.json(
        { error: "Stocul minim trebuie să fie un număr pozitiv" },
        { status: 400 }
      );
    }

    if (costPerUnit !== undefined && (typeof costPerUnit !== "number" || costPerUnit < 0)) {
      return NextResponse.json(
        { error: "Costul pe unitate trebuie să fie un număr pozitiv" },
        { status: 400 }
      );
    }

    // Check SKU uniqueness if provided
    if (sku) {
      const existingMaterial = await prisma.material.findUnique({
        where: { sku },
      });

      if (existingMaterial) {
        return NextResponse.json(
          { error: "SKU-ul specificat este deja utilizat" },
          { status: 400 }
        );
      }
    }

    const material = await prisma.material.create({
      data: {
        name: name.trim(),
        sku: sku?.trim() || null,
        unit: unit.trim(),
        stock: stock !== undefined ? stock : 0,
        minStock: minStock !== undefined ? minStock : 0,
        costPerUnit: costPerUnit !== undefined ? costPerUnit : 0,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Eroare la crearea materialului" },
      { status: 500 }
    );
  }
}
