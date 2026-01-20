import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
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
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format order details
    const orderDetails = {
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      deliveryStatus: order.deliveryStatus,
      deliveryMethod: order.deliveryMethod || "Curier",
      trackingNumber: order.trackingNumber,
      totalPrice: Number(order.totalPrice),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      
      // Customer information
      customerName: order.user?.name || order.customerName || "Client",
      customerEmail: order.user?.email || order.customerEmail,
      customerPhone: order.user?.phone || order.customerPhone,
      company: order.user?.company,
      cui: order.user?.cui,
      
      // Delivery address
      deliveryAddress: order.deliveryAddress,
      city: order.city,
      
      // Order items
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        thumbnail: item.product.images[0]?.url || null,
        specifications: {
          dimension: undefined,
          material: undefined,
          finishes: [],
          productionTime: undefined,
        },
      })),
      
      // Mock files - can be extended with actual file system
      files: [
        {
          id: "1",
          name: "design-final.pdf",
          url: "#",
          previewUrl: "#",
          type: "editor" as const,
          size: "2.4 MB",
          validation: "ok" as const,
          validationMessage: "Fișier valid",
        },
      ],
      
      // Timeline events - generated from order status
      timeline: generateTimeline(order),
      
      // History events - generated from order
      history: generateHistory(order),
    };

    return NextResponse.json(orderDetails);
  } catch (_error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

// Generate timeline events from order
function generateTimeline(order: any) {
  const timeline = [];

  // Order placed
  timeline.push({
    id: "1",
    title: "Comandă plasată",
    description: "Comanda a fost înregistrată cu succes",
    timestamp: order.createdAt.toISOString(),
    type: "success",
  });

  // Payment confirmed
  if (order.paymentStatus === "PAID") {
    timeline.push({
      id: "2",
      title: "Plată confirmată",
      description: `Plată prin ${order.paymentMethod || "card"}`,
      timestamp: order.createdAt.toISOString(),
      type: "success",
    });
  }

  // In production stages
  if (["IN_PRODUCTION", "IN_PRINTING", "QUALITY_CHECK", "READY_FOR_DELIVERY", "DELIVERED"].includes(order.status)) {
    timeline.push({
      id: "3",
      title: "Producție începută",
      description: "Comanda este în proces de producție",
      timestamp: order.createdAt.toISOString(),
      type: "info",
    });
  }

  // Ready for delivery
  if (["READY_FOR_DELIVERY", "DELIVERED"].includes(order.status)) {
    timeline.push({
      id: "4",
      title: "Gata pentru livrare",
      description: "Produsele sunt pregătite pentru expediere",
      timestamp: order.createdAt.toISOString(),
      type: "success",
    });
  }

  // Shipped
  if (order.trackingNumber && order.status === "DELIVERED") {
    timeline.push({
      id: "5",
      title: "Comandă expediată",
      description: `AWB: ${order.trackingNumber}`,
      timestamp: order.createdAt.toISOString(),
      type: "info",
    });
  }

  // Delivered
  if (order.status === "DELIVERED") {
    timeline.push({
      id: "6",
      title: "Comandă livrată",
      description: "Comanda a fost livrată cu succes",
      timestamp: order.createdAt.toISOString(),
      type: "success",
    });
  }

  return timeline;
}

// Generate history events from order
function generateHistory(order: any) {
  const history = [];

  history.push({
    id: "1",
    action: "Comandă creată",
    user: "Sistem",
    userType: "system",
    timestamp: order.createdAt.toISOString(),
    details: `Comandă #${order.id.slice(0, 8).toUpperCase()}`,
  });

  if (order.paymentStatus === "PAID") {
    history.push({
      id: "2",
      action: "Plată confirmată",
      user: "Sistem de plată",
      userType: "system",
      timestamp: order.createdAt.toISOString(),
      details: `Plată ${order.paymentMethod || "card"}`,
    });
  }

  if (order.status !== "PENDING") {
    history.push({
      id: "3",
      action: "Status actualizat",
      user: "Administrator",
      userType: "admin",
      timestamp: order.updatedAt.toISOString(),
      details: `Status schimbat în: ${order.status}`,
    });
  }

  return history;
}
