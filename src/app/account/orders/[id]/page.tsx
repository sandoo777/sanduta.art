// Server Component — Data fetching for single order
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import OrderDetailClient from './OrderDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  // 1. Await params (Next.js 15 requirement)
  const { id } = await params;

  // 2. Auth check server-side
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/account/orders');
  }

  // 3. Fetch order directly from database
  const order = await prisma.order.findUnique({
    where: {
      id: parseInt(id, 10),
      userId: session.user.id, // Security: only user's own orders
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      paynetSessionId: true,
      customer: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      delivery: {
        select: {
          address: true,
          city: true,
          county: true,
          postalCode: true,
          trackingNumber: true,
        },
      },
      payment: {
        select: {
          status: true,
          method: true,
          amount: true,
        },
      },
      orderItems: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
              image_url: true,
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

  // 5. Transform data for client
  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
    paynetSessionId: order.paynetSessionId,
    customer: order.customer,
    delivery: order.delivery,
    payment: order.payment,
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        image_url: item.product.image_url,
      },
    })),
  };

  // 6. Pass data to Client Component
