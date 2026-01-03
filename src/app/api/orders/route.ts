import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, total, customer_name, customer_email } = body;

    if (!products || !total || !customer_name || !customer_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        total,
        customerName: customer_name,
        customerEmail: customer_email,
      },
    });

    // Create order items
    for (const item of products) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
        },
      });
    }

    return NextResponse.json({ message: 'Order submitted successfully', order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}