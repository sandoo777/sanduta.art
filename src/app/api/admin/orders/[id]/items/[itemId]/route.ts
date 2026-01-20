import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * Helper function to recalculate order total
 */
async function recalculateOrderTotal(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
  });

  const totalPrice = items.reduce((sum: number, item: any) => {
    return sum + Number(item.lineTotal);
  }, 0);

  await prisma.order.update({
    where: { id: orderId },
    data: { totalPrice },
  });
}

/**
 * PATCH /api/admin/orders/[id]/items/[itemId]
 * Update an order item
 *
 * Body:
 * {
 *   quantity?: number,
 *   customDescription?: string
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { quantity, customDescription } = body;

    // Validation
    if (quantity !== undefined && quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Verify item belongs to the order
    if (existingItem.orderId !== id) {
      return NextResponse.json(
        { error: "Item does not belong to this order" },
        { status: 400 }
      );
    }

    // Update item
    const updateData: any = {};
    if (quantity !== undefined) {
      updateData.quantity = quantity;
      updateData.lineTotal = Number(existingItem.unitPrice) * quantity;
    }
    if (customDescription !== undefined) {
      updateData.customDescription = customDescription || null;
    }

    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    });

    // Recalculate order total
    await recalculateOrderTotal(id);

    return NextResponse.json(item);
  } catch (_error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders/[id]/items/[itemId]
 * Delete an order item
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if item exists
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Verify item belongs to the order
    if (item.orderId !== id) {
      return NextResponse.json(
        { error: "Item does not belong to this order" },
        { status: 400 }
      );
    }

    // Delete item
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Recalculate order total
    await recalculateOrderTotal(id);

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (_error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
