import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  try {
    console.log('[/account/orders] Page rendering started');
    
    // Verificare autentificare server-side
    console.log('[/account/orders] Getting session...');
    const session = await getServerSession(authOptions);
    console.log('[/account/orders] Session:', session?.user?.email || 'not authenticated');
    
    if (!session?.user?.id) {
      console.log('[/account/orders] No session, redirecting to signin');
      return safeRedirect('/auth/signin');
    }

    // Validate user ID
    const userId = validateServerData(session.user.id, 'User ID missing');

    console.log('[/account/orders] Fetching orders for user:', userId);
    
    // Query direct Prisma pentru comenzile utilizatorului cu safe wrapper
    const orders = await fetchServerData(
      () => prisma.order.findMany({
        where: {
      customerId: userId,
    },
    select: {
      id: true,
      customerId: true,
      status: true,
      paymentStatus: true,
      totalPrice: true,
      createdAt: true,
      updatedAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: {
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
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

  console.log('[/account/orders] Found', orders.length, 'orders');

  // Transformare date pentru Client Component (serializare pentru React)
  const ordersData = orders.map((order: any) => ({
    id: order.id,
    customerId: order.customerId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalPrice: order.totalPrice.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    orderItems: order.orderItems.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price.toString(),
        images: item.product.images,
      },
    })),
  }));

  console.log('[/account/orders] Rendering OrdersClient component');
  // Render Client Component cu datele prefetchate
  return <OrdersClient orders={ordersData} />;
  } catch (error) {
    console.error('[/account/orders] Error:', error);
    // Return empty state on error
    return <OrdersClient orders={[]} />;
  }
}
