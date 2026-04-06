// Server Component — Data fetching for single order
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { notFound } from 'next/navigation';
import { safeRedirect, validateServerData } from '@/lib/serverSafe';
import { prisma } from '@/lib/prisma';
import OrderDetailClient from './OrderDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  try {
    // 1. Await params (Next.js 15 requirement)
    const { id } = await params;

    // 2. Auth check server-side
    const session = await getServerSession(authOptions);
    if (!session) {
      return safeRedirect('/login?callbackUrl=/account/orders');
    }

    // Validate session has user ID
    validateServerData(session?.user?.id, 'User ID not found in session');

    // 3. Fetch order directly from database
    const order = await prisma.order.findUnique({
      where: {
        id: id,
        userId: session!.user.id, // Security: only user's own orders
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        paynetSessionId: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryAddress: true,
        city: true,
        trackingNumber: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            lineTotal: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    // 4. If order not found, show 404
    if (!order) {
      notFound();
    }

    // 5. Transform data for client (convert Decimal to number for serialization)
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalPrice),
      createdAt: order.createdAt.toISOString(),
      paynetSessionId: order.paynetSessionId,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      city: order.city,
      trackingNumber: order.trackingNumber,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      delivery: null,
      payment: null,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          category: item.product.category,
          price: Number(item.product.price),
          image_url: item.product.images[0]?.url || null,
        },
      })),
    };

    // 6. Pass data to Client Component
    return <OrderDetailClient order={orderData} />;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    throw error; // Let Next.js error boundary handle it
  }
}
