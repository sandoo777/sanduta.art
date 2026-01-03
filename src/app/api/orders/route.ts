import { NextRequest, NextResponse } from 'next/server';
import { orders } from '@/lib/data';
import { Order } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, total, customer_name, customer_email } = body;

    if (!products || !total || !customer_name || !customer_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newOrder: Order = {
      id: orders.length + 1,
      products,
      total,
      customer_name,
      customer_email,
      created_at: new Date().toISOString(),
    };

    orders.push(newOrder);

    return NextResponse.json({ message: 'Order submitted successfully', order: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}