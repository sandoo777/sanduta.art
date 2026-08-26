import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/[id]
 * Returns a single order owned by the authenticated user.
 * Used by the checkout success page and account order detail.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: rateLimitResult.error }, { status: 429 });
    }

    const { id } = await params;

    // Auth is optional — allow fetching by orderId without session for guests
    // (checkout success page); if session exists, verify ownership.
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const whereClause = userId ? { id, userId } : { id };

    const order = await prisma.order.findFirst({
      where: whereClause,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        totalPrice: true,
        currency: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        deliveryMethod: true,
        deliveryAddress: true,
        city: true,
        trackingNumber: true,
        createdAt: true,
        paynetSessionId: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            lineTotal: true,
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
    });

    if (!order) {
      return createErrorResponse('Order not found', 404);
    }

    logger.info('API:Orders', 'Order fetched', { orderId: id });

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber ?? order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalPrice: Number(order.totalPrice),
      currency: order.currency,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryMethod: order.deliveryMethod,
      deliveryAddress: order.deliveryAddress,
      city: order.city,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt.toISOString(),
      paynetSessionId: order.paynetSessionId,
      items: order.orderItems.map((item) => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    });
  } catch (err) {
    logApiError('API:Orders', err, { action: 'get_order' });
    return createErrorResponse('Failed to fetch order', 500);
  }
}
