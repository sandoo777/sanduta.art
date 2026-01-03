import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { sendOrderEmails, OrderEmailData } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user's orders
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      products, 
      total, 
      customer_name, 
      customer_email, 
      customer_phone,
      userId,
      payment_method,
      delivery_method,
      delivery_address,
      city,
      novaposhta_warehouse,
      tracking_number,
    } = body;

    if (!products || !total || !customer_name || !customer_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        total,
        customerName: customer_name,
        customerEmail: customer_email,
        customerPhone: customer_phone,
        userId,
        status: "pending",
        paymentStatus: payment_method === 'card' ? 'paid' : 'pending',
        deliveryStatus: "pending",
        paymentMethod: payment_method,
        deliveryMethod: delivery_method,
        deliveryAddress: delivery_address,
        city: city,
        novaPoshtaWarehouse: novaposhta_warehouse,
        trackingNumber: tracking_number,
      },
    });

    // Create order items
    const orderItems = [];
    for (const item of products) {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
        },
        include: {
          product: true,
        },
      });
      orderItems.push(orderItem);
    }

    // Prepare email data
    const emailData: OrderEmailData = {
      orderId: order.id,
      orderNumber: `${order.id}`,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || '',
      items: orderItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image_url: item.product.image_url || undefined,
      })),
      subtotal: total,
      shippingCost: 0, // You can calculate shipping cost based on delivery method
      total: total,
      paymentMethod: payment_method || 'cash',
      deliveryMethod: delivery_method || 'pickup',
      deliveryAddress: delivery_address,
      city: city,
      novaPoshtaWarehouse: novaposhta_warehouse,
      trackingNumber: tracking_number,
      createdAt: order.createdAt,
    };

    // Send emails (don't wait for completion to avoid slowing down the response)
    sendOrderEmails(emailData).catch(error => {
      console.error('Failed to send order emails:', error);
    });

    return NextResponse.json({ message: 'Order submitted successfully', order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}