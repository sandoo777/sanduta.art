import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            orderItems: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = user.orders.map((order) => ({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      totalPrice: Number(order.totalPrice),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      items: order.orderItems.map((item) => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        thumbnail: item.product.images[0]?.url,
      })),
      deliveryAddress: order.deliveryAddress,
      deliveryMethod: order.deliveryMethod,
      trackingNumber: order.trackingNumber,
    }));

    return NextResponse.json(orders);
  } catch (_error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
