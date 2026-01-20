import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // 2. Role check - only ADMIN, MANAGER, OPERATOR can update status
    const allowedRoles = ['ADMIN', 'MANAGER', 'OPERATOR'];
    if (!allowedRoles.includes(session.user.role)) {
      return createErrorResponse('Forbidden - insufficient permissions', 403);
    }

    // 3. Parse request body
    const { status, note } = await req.json();

    if (!status) {
      return createErrorResponse('Status is required', 400);
    }

    // 4. Validate status enum
    const validStatuses = [
      'PENDING',
      'IN_PREPRODUCTION',
      'IN_DESIGN',
      'IN_PRODUCTION',
      'IN_PRINTING',
      'QUALITY_CHECK',
      'READY_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return createErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    logger.info('API:UpdateOrderStatus', 'Updating order status', {
      orderId: params.id,
      newStatus: status,
      userId: session.user.id,
      note,
    });

    // 5. Fetch order to get customer details
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        status: true,
        trackingNumber: true,
      },
    });

    if (!existingOrder) {
      return createErrorResponse('Order not found', 404);
    }

    // 6. Update order status in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const order = await tx.order.update({
        where: { id: params.id },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Add timeline entry (if you have a timeline/history table)
      // await tx.orderTimeline.create({
      //   data: {
      //     orderId: params.id,
      //     type: 'STATUS_CHANGED',
      //     description: `Status changed to ${status}`,
      //     userId: session.user.id,
      //     metadata: { oldStatus: existingOrder.status, newStatus: status },
      //   },
      // });

      // Add note if provided
      if (note) {
        // await tx.orderNote.create({
        //   data: {
        //     orderId: params.id,
        //     note,
        //     userId: session.user.id,
        //   },
        // });
      }

      return order;
    });

    // 7. Send email notification to customer (non-blocking)
    // Only send for meaningful status changes (not for PENDING)
    const shouldNotify = !['PENDING'].includes(status);
    
    if (shouldNotify) {
      sendOrderStatusUpdateEmail({
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        customerName: existingOrder.customerName,
        customerEmail: existingOrder.customerEmail,
        status: status,
        trackingNumber: existingOrder.trackingNumber || undefined,
      }).catch((error) => {
        // Log error but don't fail the request
        logger.error('API:UpdateOrderStatus', 'Failed to send status email', {
          orderId: params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });
    }

    logger.info('API:UpdateOrderStatus', 'Order status updated successfully', {
      orderId: params.id,
      newStatus: status,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    logApiError('API:UpdateOrderStatus', error);
    return createErrorResponse('Failed to update order status', 500);
  }
}
