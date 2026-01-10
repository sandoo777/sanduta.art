import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, createErrorResponse } from '@/lib/logger';

// GET /api/account/invoices - Fetch all user invoices
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    logger.info('API:Account', 'Fetching invoices', { userId: user.id });

    // Get orders with payment information
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to invoice format
    const invoices = orders
      .filter(order => order.payment)
      .map(order => ({
        id: order.payment!.id,
        invoiceNumber: `INV-${order.payment!.id.slice(-8).toUpperCase()}`,
        orderId: order.id,
        date: order.createdAt.toISOString(),
        amount: order.total,
        status: order.payment!.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        downloadUrl: `/api/account/invoices/${order.payment!.id}/download`,
      }));

    return NextResponse.json(invoices);
  } catch (err) {
    logger.error('API:Account', 'Error fetching invoices', { error: err });
    return createErrorResponse('Failed to fetch invoices', 500);
  }
}
