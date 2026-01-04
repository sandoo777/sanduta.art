import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paynetClient } from '@/lib/paynet';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('API:Paynet', 'Creating payment session');
    
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      logger.warn('API:Paynet', 'Missing orderId');
      return createErrorResponse('Order ID is required', 400);
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      logger.warn('API:Paynet', 'Order not found', { orderId });
      return createErrorResponse('Order not found', 404);
    }

    logger.info('API:Paynet', 'Creating Paynet session', { orderId, amount: order.totalPrice });

    // Create Paynet session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    try {
      const paynetSession = await paynetClient.createSession({
        orderId: order.id,
        amount: Number(order.totalPrice),
        description: `Payment for order ${order.id}`,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        returnUrl: `${baseUrl}/checkout?orderId=${order.id}&payment=success`,
      });

      // Store session ID in order
      await prisma.order.update({
        where: { id: orderId },
        data: { paynetSessionId: paynetSession.session_id },
      });

      logger.info('API:Paynet', 'Payment session created successfully', { 
        orderId, 
        sessionId: paynetSession.session_id 
      });

      return NextResponse.json(
        {
          message: 'Paynet session created',
          sessionId: paynetSession.session_id,
          paymentUrl: paynetSession.payment_url,
        },
        { status: 200 }
      );
    } catch (paynetError) {
      logApiError('API:Paynet', paynetError, { orderId, service: 'paynet_api' });
      return createErrorResponse(
        'Payment service temporarily unavailable. Please try again or choose cash on delivery.',
        503,
        { fallback: 'cod_available' }
      );
    }
  } catch (error) {
    logApiError('API:Paynet', error, { action: 'create_payment_session' });
    return createErrorResponse('Failed to create payment session. Please try again later.', 500);
  }
}
