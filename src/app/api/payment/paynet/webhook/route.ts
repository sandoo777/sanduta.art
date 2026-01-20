import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paynetClient } from '@/lib/paynet';

export async function POST(_request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature') || '';
    const body = await request.text();

    // Verify webhook signature
    const isValid = await paynetClient.verifyWebhook(signature, body);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { session_id, order_id, status, amount } = data;

    if (!session_id || !order_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update order payment status
    const paymentStatus = status === 'completed' ? 'paid' : status === 'failed' ? 'failed' : 'pending';

    await prisma.order.update({
      where: { id: order_id },
      data: {
        paymentStatus: paymentStatus === 'paid' ? 'PAID' : paymentStatus === 'failed' ? 'FAILED' : 'PENDING',
        // Move the order into the first production stage once the payment clears
        status: paymentStatus === 'paid' ? 'IN_PREPRODUCTION' : 'PENDING',
      },
    });

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (_error) {
    console.error('Error processing Paynet webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
