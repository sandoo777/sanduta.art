import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paynetClient } from '@/lib/paynet';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature') || '';
    const body = await request.text();

    // Verify webhook signature
    const isValid = await paynetClient.verifyWebhook(signature, body);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { session_id, order_id, status } = data;

    if (!session_id || !order_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const paymentStatus =
      status === 'completed' ? 'PAID' :
      status === 'failed'    ? 'FAILED' :
                               'PENDING';

    const orderStatus =
      paymentStatus === 'PAID' ? 'IN_PREPRODUCTION' : 'PENDING';

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      select: { id: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.order.update({
      where: { id: order_id },
      data: { paymentStatus, status: orderStatus },
    });

    // Log to OrderTimeline
    await prisma.orderTimeline.create({
      data: {
        orderId: order_id,
        eventType: 'payment_update',
        description: `Plată ${paymentStatus === 'PAID' ? 'confirmată' : paymentStatus === 'FAILED' ? 'eșuată' : 'în așteptare'} via Paynet`,
        eventData: {
          sessionId: session_id,
          previousPaymentStatus: order.paymentStatus,
          newPaymentStatus: paymentStatus,
          rawStatus: status,
        },
      },
    });

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('Error processing Paynet webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
