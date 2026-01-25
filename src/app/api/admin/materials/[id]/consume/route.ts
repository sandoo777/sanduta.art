import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/materials/[id]/consume
 * Consume material for a production job
 */
export async function POST(
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
    const { jobId, quantity } = body;

    // Validations
    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "ID-ul job-ului este obligatoriu" },
        { status: 400 }
      );
    }

    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { error: "Cantitatea trebuie să fie un număr pozitiv" },
        { status: 400 }
      );
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

    // Check if job exists
    const job = await prisma.productionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job-ul de producție nu a fost găsit" },
        { status: 404 }
      );
    }

    // Check if there's enough stock
    if (material.stock < quantity) {
      return NextResponse.json(
        { 
          error: "Stoc insuficient",
          available: material.stock,
          requested: quantity
        },
        { status: 400 }
      );
    }

    // Calculate new stock
    const newStock = material.stock - quantity;

    // Create material usage and update stock in a transaction
    const result = await prisma.$transaction([
      prisma.materialUsage.create({
        data: {
          materialId: id,
          jobId,
          quantity,
        },
      }),
      prisma.material.update({
        where: { id },
        data: { stock: newStock },
      }),
    ]);

    const [materialUsage, updatedMaterial] = result;

    // Check if stock is below minimum threshold
    const lowStockWarning = newStock < material.minStock;

    return NextResponse.json({
      success: true,
      materialUsage,
      material: updatedMaterial,
      warning: lowStockWarning ? {
        message: "Atenție: Stocul este sub pragul minim!",
        currentStock: newStock,
        minStock: material.minStock,
      } : null,
    });
  } catch (error) {
    console.error("Error consuming material:", error);
    return NextResponse.json(
      { error: "Eroare la consumul materialului" },
      { status: 500 }
    );
  }
}
