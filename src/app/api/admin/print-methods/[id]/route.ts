import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/print-methods/[id] - Get single print method
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const printMethod = await prisma.printMethod.findUnique({
      where: { id },
    });

    if (!printMethod) {
      return NextResponse.json(
        { error: "Print method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...printMethod,
      costPerM2: printMethod.costPerM2 ? Number(printMethod.costPerM2) : null,
      costPerSheet: printMethod.costPerSheet ? Number(printMethod.costPerSheet) : null,
      createdAt: printMethod.createdAt.toISOString(),
      updatedAt: printMethod.updatedAt.toISOString(),
    });
  } catch (_error) {
    console.error("Error fetching print method:", error);
    return NextResponse.json(
      { error: "Failed to fetch print method" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/print-methods/[id] - Update print method
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.type !== undefined) updateData.type = body.type.trim();
    if (body.costPerM2 !== undefined) updateData.costPerM2 = body.costPerM2 ? Number(body.costPerM2) : null;
    if (body.costPerSheet !== undefined) updateData.costPerSheet = body.costPerSheet ? Number(body.costPerSheet) : null;
    if (body.speed !== undefined) updateData.speed = body.speed?.trim() || null;
    if (body.maxWidth !== undefined) updateData.maxWidth = body.maxWidth ? Number(body.maxWidth) : null;
    if (body.maxHeight !== undefined) updateData.maxHeight = body.maxHeight ? Number(body.maxHeight) : null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.materialIds !== undefined) updateData.materialIds = body.materialIds;

    const printMethod = await prisma.printMethod.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...printMethod,
      costPerM2: printMethod.costPerM2 ? Number(printMethod.costPerM2) : null,
      costPerSheet: printMethod.costPerSheet ? Number(printMethod.costPerSheet) : null,
      createdAt: printMethod.createdAt.toISOString(),
      updatedAt: printMethod.updatedAt.toISOString(),
    });
  } catch (_error) {
    console.error("Error updating print method:", error);
    return NextResponse.json(
      { error: "Failed to update print method" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/print-methods/[id] - Delete print method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.printMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error("Error deleting print method:", error);
    return NextResponse.json(
      { error: "Failed to delete print method" },
      { status: 500 }
    );
  }
}
