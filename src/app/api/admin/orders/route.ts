import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('API:Admin:Orders', 'Fetching all orders');
    
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    logger.info('API:Admin:Orders', `Fetched ${orders.length} orders`);

    return NextResponse.json(orders);
  } catch (error) {
    logApiError('API:Admin:Orders', error, { action: 'fetch_orders' });
    return createErrorResponse('Failed to fetch orders', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus, deliveryStatus } = body;

    if (!orderId) {
      logger.warn('API:Admin:Orders', 'Missing orderId in update request');
      return createErrorResponse('Order ID is required', 400);
    }

    logger.info('API:Admin:Orders', 'Updating order', { orderId, status, paymentStatus, deliveryStatus });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(deliveryStatus && { deliveryStatus }),
      },
    });

    logger.info('API:Admin:Orders', 'Order updated successfully', { orderId });

    return NextResponse.json(updated);
  } catch (error) {
    logApiError('API:Admin:Orders', error, { action: 'update_order' });
    return createErrorResponse('Failed to update order', 500);
  }
}