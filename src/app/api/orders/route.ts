import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { sendOrderEmails, OrderEmailData } from '@/lib/email';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('API:Orders', 'Fetching user orders');
    
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      logger.warn('API:Orders', 'Unauthorized access attempt');
      return createErrorResponse('Unauthorized. Please log in.', 401);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      logger.warn('API:Orders', 'User not found', { email: session.user.email });
      return createErrorResponse('User not found', 404);
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

    logger.info('API:Orders', `Fetched ${orders.length} orders`, { userId: user.id });

    return NextResponse.json({ orders });
  } catch (error) {
    logApiError('API:Orders', error, { action: 'fetch_orders' });
    return createErrorResponse('Failed to fetch orders. Please try again later.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.info('API:Orders', 'Creating new order');
    
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
      logger.warn('API:Orders', 'Missing required fields', { 
        hasProducts: !!products, 
        hasTotal: !!total, 
        hasName: !!customer_name, 
        hasEmail: !!customer_email 
      });
      return createErrorResponse('Missing required fields: products, total, name, and email are required', 400);
    }

    if (!Array.isArray(products) || products.length === 0) {
      logger.warn('API:Orders', 'Invalid products array');
      return createErrorResponse('Cart is empty or invalid', 400);
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        totalPrice: total,
        customerName: customer_name,
        customerEmail: customer_email,
        customerPhone: customer_phone,
        userId,
        status: "PENDING",
        paymentStatus: payment_method === 'card' ? 'PAID' : 'PENDING',
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
        price: Number(item.product.price),
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
      logApiError('API:Orders:Email', error, { orderId: order.id });
    });

    logger.info('API:Orders', 'Order created successfully', { 
      orderId: order.id, 
      total: order.totalPrice, 
      itemCount: orderItems.length 
    });

    return NextResponse.json({ message: 'Order submitted successfully', order }, { status: 201 });
  } catch (error) {
    logApiError('API:Orders', error, { action: 'create_order' });
    return createErrorResponse('Failed to create order. Please try again or contact support.', 500);
  }
}