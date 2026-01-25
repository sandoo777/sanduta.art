// Server Component — Data fetching with direct Prisma access
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import ManagerOrdersClient from './ManagerOrdersClient';

export default async function ManagerOrdersPage() {
  // 1. Auth check server-side
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // 2. Role check
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
    redirect('/');
  }

  // 3. Fetch orders directly from database
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      orderItems: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 4. Transform data for client
  const ordersData = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer?.name || 'Unknown',
    customerEmail: order.customer?.email || 'N/A',
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
    items: order.orderItems.length,
  }));

  // 5. Pass data to Client Component for interactivity
  return <ManagerOrdersClient orders={ordersData} />;
}
