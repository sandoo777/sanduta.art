import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

export async function GET() {
  const { error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;

  try {
    // Get top products by order count
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product names
    const productIds = topProducts.map((item) => item.productId);
    const productsData = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Map products with sales data
    const products = topProducts.map((item) => {
      const product = productsData.find((p) => p.id === item.productId);
      return {
        name: product?.name || 'Unknown Product',
        sales: item._sum.quantity || 0,
      };
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Error fetching top products:', err);
    return NextResponse.json(
      { error: 'Failed to fetch top products' },
      { status: 500 }
    );
  }
}
