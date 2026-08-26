import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { paynetClient } from '@/lib/paynet';
import { logger, logApiError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/initiate
 *
 * Initiates a Paynet payment for an existing order.
 * Body: { orderId: string }
 * Returns: { paymentIntentId, paymentUrl, orderId, fallback? }
 *
 * On Paynet API failure, falls back to COD (cash on delivery) gracefully.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId } = body ?? {};

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Optional auth — guests can also initiate payment (no session required)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const whereClause = userId ? { id: orderId, userId } : { id: orderId };

    const order = await prisma.order.findFirst({
      where: whereClause,
      select: {
        id: true,
        orderNumber: true,
        totalPrice: true,
        customerEmail: true,
        customerName: true,
        paymentStatus: true,
        paynetSessionId: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If already paid, return success immediately
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentStatus: 'PAID',
        alreadyPaid: true,
      });
    }

    // If there's an existing session, return it (idempotent)
    if (order.paynetSessionId) {
      logger.info('API:Payments', 'Reusing existing Paynet session', {
        orderId,
        sessionId: order.paynetSessionId,
      });
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentIntentId: order.paynetSessionId,
        paymentUrl: `${baseUrl}/checkout/success?orderId=${order.id}`,
      });
    }

    logger.info('API:Payments', 'Creating Paynet session', {
      orderId,
      amount: order.totalPrice,
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
      const session = await paynetClient.createSession({
        orderId: order.id,
        amount: Number(order.totalPrice),
        description: `Plata pentru comanda ${order.orderNumber ?? order.id}`,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        returnUrl: `${baseUrl}/checkout/success?orderId=${order.id}&payment=success`,
      });

      // Persist session ID so future calls are idempotent
      await prisma.order.update({
        where: { id: orderId },
        data: { paynetSessionId: session.session_id },
      });

      // Add OrderTimeline entry
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          eventType: 'payment_initiated',
          description: 'Sesiune de plată Paynet creată',
          eventData: { sessionId: session.session_id },
        },
      });

      logger.info('API:Payments', 'Paynet session created', {
        orderId,
        sessionId: session.session_id,
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentIntentId: session.session_id,
        paymentUrl: session.payment_url,
      });
    } catch (paynetError) {
      // Paynet unavailable → fall back to COD silently
      logApiError('API:Payments', paynetError, { orderId, service: 'paynet' });

      logger.warn('API:Payments', 'Paynet unavailable, falling back to COD', { orderId });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        fallback: 'cod',
        paymentUrl: `${baseUrl}/checkout/success?orderId=${order.id}&payment=cod`,
      });
    }
  } catch (err) {
    logApiError('API:Payments', err, { action: 'initiate' });
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
