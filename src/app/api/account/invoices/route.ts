import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, createErrorResponse } from '@/lib/logger';

// GET /api/account/invoices - Fetch all user invoices
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    logger.info('API:Account', 'Fetching invoices', { userId: user.id });

    // Get orders - no separate payment table, payment info is in Order
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to invoice format
    const invoices = orders.map(order => ({
      id: order.id,
      invoiceNumber: order.orderNumber || `INV-${order.id.slice(-8).toUpperCase()}`,
      orderId: order.id,
      date: order.createdAt.toISOString(),
      amount: Number(order.totalPrice),
      status: order.paymentStatus === 'COMPLETED' ? 'PAID' as const : 
              order.paymentStatus === 'PENDING' ? 'PENDING' as const : 
              'OVERDUE' as const,
      downloadUrl: `/api/account/invoices/${order.id}/download`,
    }));

    return NextResponse.json(invoices);
  } catch (err) {
    logger.error('API:Account', 'Error fetching invoices', { error: err });
    return createErrorResponse('Failed to fetch invoices', 500);
  }
}
