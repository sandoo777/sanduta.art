import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/modules/auth/nextauth';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

/**
 * GET /api/orders/[id]
 * 
 * Fetch order details by ID
 * Works for both authenticated users and guest orders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    logger.info('API:Orders:GetById', 'Fetching order', { orderId: id });

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      logger.warn('API:Orders:GetById', 'Order not found', { orderId: id });
      return createErrorResponse('Comanda nu a fost găsită', 404);
    }

    // If user is authenticated, verify ownership
    if (session?.user?.id && order.userId && order.userId !== session.user.id) {
      logger.warn('API:Orders:GetById', 'Unauthorized access attempt', {
        orderId: id,
        requestedBy: session.user.id,
        ownerId: order.userId,
      });
      return createErrorResponse('Nu aveți permisiunea de a accesa această comandă', 403);
    }

    // Format response
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      totalPrice: Number(order.totalPrice),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      deliveryMethod: order.deliveryMethod || 'N/A',
      paymentMethod: order.paymentMethod || 'N/A',
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      deliveryAddress: order.deliveryAddress,
      city: order.city,
      createdAt: order.createdAt.toISOString(),
      estimatedDelivery: null, // Can be calculated based on delivery method
      items: order.orderItems.map((item) => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        imageUrl: item.product.imageUrl,
      })),
    };

    logger.info('API:Orders:GetById', 'Order fetched successfully', {
      orderId: id,
      itemCount: formattedOrder.items.length,
    });

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    logApiError('API:Orders:GetById', error, { action: 'fetch_order' });
    return createErrorResponse('Eroare la încărcarea comenzii', 500);
  }
}
