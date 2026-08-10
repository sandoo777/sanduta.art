import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

/**
 * GET /api/admin/orders/stats
 * Returns order counts grouped by status and payment status.
 */
export async function GET() {
  const { error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;

  try {
    const [byStatus, byPayment, total] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: { _all: true },
      }),
      prisma.order.count(),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const row of byStatus) {
      statusCounts[row.status] = row._count._all;
    }

    const paymentCounts: Record<string, number> = {};
    for (const row of byPayment) {
      paymentCounts[row.paymentStatus] = row._count._all;
    }

    return NextResponse.json({ total, byStatus: statusCounts, byPayment: paymentCounts });
  } catch (err) {
    console.error('Error fetching order stats:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
