import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paynetClient } from '@/lib/paynet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create Paynet session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const paynetSession = await paynetClient.createSession({
      orderId: order.id,
      amount: order.total,
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

    return NextResponse.json(
      {
        message: 'Paynet session created',
        sessionId: paynetSession.session_id,
        paymentUrl: paynetSession.payment_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating Paynet session:', error);
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 });
  }
}
