import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/materials/[id]
 * Get a single material with consumption history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        consumption: {
          include: {
            job: {
              include: {
                order: {
                  select: {
                    id: true,
                    customerName: true,
                    customerEmail: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Materialul nu a fost găsit" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (_error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { error: "Eroare la preluarea materialului" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/materials/[id]
 * Update a material
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const body = await request.json();
    const { name, sku, unit, stock, minStock, costPerUnit, notes } = body;

    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Materialul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Validations
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      return NextResponse.json(
        { error: "Numele materialului este obligatoriu" },
        { status: 400 }
      );
    }

    if (unit !== undefined && (typeof unit !== "string" || unit.trim() === "")) {
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

    // Check SKU uniqueness if it's being changed
    if (sku && sku !== existingMaterial.sku) {
      const duplicateSku = await prisma.material.findUnique({
        where: { sku },
      });

      if (duplicateSku) {
        return NextResponse.json(
          { error: "SKU-ul specificat este deja utilizat" },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (sku !== undefined) updateData.sku = sku?.trim() || null;
    if (unit !== undefined) updateData.unit = unit.trim();
    if (stock !== undefined) updateData.stock = stock;
    if (minStock !== undefined) updateData.minStock = minStock;
    if (costPerUnit !== undefined) updateData.costPerUnit = costPerUnit;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const material = await prisma.material.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(material);
  } catch (_error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea materialului" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/materials/[id]
 * Delete a material (only if no consumption exists)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    // Check if material exists
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Materialul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Check if material has consumption
    const consumptionCount = await prisma.materialUsage.count({
      where: { materialId: id },
    });

    if (consumptionCount > 0) {
      return NextResponse.json(
        { 
          error: "Nu se poate șterge materialul deoarece are consum asociat",
          consumptionCount 
        },
        { status: 400 }
      );
    }

    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Materialul a fost șters cu succes" 
    });
  } catch (_error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Eroare la ștergerea materialului" },
      { status: 500 }
    );
  }
}
