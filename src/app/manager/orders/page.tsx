// Server Component — Data fetching with direct Prisma access
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import prisma from '@/lib/prisma';
import ManagerOrdersClient from './ManagerOrdersClient';
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function ManagerOrdersPage() {
  try {
    // 1. Auth check server-side
    const session = await getServerSession(authOptions);
    if (!session) {
      return safeRedirect('/login');
    }

    // 2. Validate session data
    const userRole = validateServerData(
      session?.user?.role,
      'User role not found in session'
    );

    // 3. Role check
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return safeRedirect('/');
    }

    // 4. Fetch orders directly from database with safe wrapper
    const orders = await fetchServerData(
      () => prisma.order.findMany({
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
      }),
      {
        timeout: 10000,
        retries: 2,
      }
    );

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
