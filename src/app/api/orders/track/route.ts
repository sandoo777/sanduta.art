import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId || !email) {
      return createErrorResponse('Order ID and email are required', 400);
    }

    logger.info('API:OrderTrack', 'Tracking order', { orderId, email });

    // Find order with matching email
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerEmail: email
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        payment: true,
        delivery: true
      }
    });

    if (!order) {
      return createErrorResponse('Order not found', 404);
    }

    // Build tracking timeline
    const timeline = [
      {
        status: 'PENDING',
        label: 'Comandă plasată',
        date: order.createdAt,
        completed: true
      },
      {
        status: 'CONFIRMED',
        label: 'Comandă confirmată',
        date: order.confirmedAt,
        completed: !!order.confirmedAt
      },
      {
        status: 'IN_PRODUCTION',
        label: 'În producție',
        date: order.productionStartedAt,
        completed: order.status === 'IN_PRODUCTION' || order.status === 'DELIVERED'
      },
      {
        status: 'SHIPPED',
        label: 'Expediată',
        date: order.shippedAt,
        completed: order.status === 'DELIVERED'
      },
      {
        status: 'DELIVERED',
        label: 'Livrată',
        date: order.deliveredAt,
        completed: order.status === 'DELIVERED'
      }
    ];

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
        payment: order.payment,
        delivery: order.delivery
      },
      timeline
    });
  } catch (error) {
    logApiError('API:OrderTrack', error);
    return createErrorResponse('Failed to track order', 500);
  }
}
