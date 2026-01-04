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
 * POST /api/admin/orders/[id]/items
 * Add a new item to order
 *
 * Body:
 * {
 *   productId: string,
 *   variantId?: string,
 *   quantity: number,
 *   customDescription?: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, variantId, quantity, customDescription } = body;

    // Validations
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Product ID and valid quantity required" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get product and verify it exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: variantId ? { id: variantId } : undefined,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 400 }
      );
    }

    // Get unit price
    let unitPrice = Number(product.price) || 0;
    if (variantId) {
      const variant = product.variants.find((v: any) => v.id === variantId);
      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 400 }
        );
      }
      unitPrice = Number(variant.price);
    }

    const lineTotal = unitPrice * quantity;

    // Create item
    const item = await prisma.orderItem.create({
      data: {
        orderId: params.id,
        productId,
        variantId: variantId || undefined,
        quantity,
        customDescription: customDescription || undefined,
        unitPrice,
        lineTotal,
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    });

    // Recalculate order total
    await recalculateOrderTotal(params.id);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json(
      { error: "Failed to add item" },
      { status: 500 }
    );
  }
}
