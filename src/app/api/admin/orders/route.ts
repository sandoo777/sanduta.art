import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/orders
 * List all orders with pagination and filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Pagination parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filter parameters
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        files: true,
        _count: {
          select: {
            orderItems: true,
            files: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (_error) {
    console.error("Error fetching orders:", _error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/orders
 * Create a new order
 *
 * Body:
 * {
 *   customerId: string,
 *   source: "ONLINE" | "OFFLINE",
 *   channel: "WEB" | "PHONE" | "WALK_IN" | "EMAIL",
 *   items: [
 *     {
 *       productId: string,
 *       variantId?: string,
 *       quantity: number,
 *       customDescription?: string
 *     }
 *   ],
 *   dueDate?: string
 * }
 */
export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { customerId, source, channel, items, dueDate } = body;

    // Validations
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer is required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 400 }
      );
    }

    // Verify all products exist and get their prices
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Product ID and valid quantity required for each item" },
          { status: 400 }
        );
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: {
            where: item.variantId ? { id: item.variantId } : undefined,
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      // Get unit price from variant or product
      let unitPrice = Number(product.price) || 0;
      if (item.variantId) {
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Variant ${item.variantId} not found` },
            { status: 400 }
          );
        }
        unitPrice = Number(variant.price);
      }

      const lineTotal = unitPrice * item.quantity;
      totalPrice += lineTotal;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
        customDescription: item.customDescription || undefined,
        unitPrice,
        lineTotal,
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId,
        customerName: customer.name,
        customerEmail: customer.email || "",
        customerPhone: customer.phone || undefined,
        source: source || "ONLINE",
        channel: channel || "WEB",
        status: "PENDING",
        paymentStatus: "PENDING",
        totalPrice,
        currency: "MDL",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
        files: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (_error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
