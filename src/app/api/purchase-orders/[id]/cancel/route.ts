import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) return createErrorResponse('Purchase order not found', 404);

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.purchaseOrderEvent.create({
      data: {
        purchaseOrderId: id,
        eventType: 'CANCELLED',
        message: 'Purchase order marked cancelled by procurement',
      },
    });

    logger.info('API:PurchaseOrders:Cancel', 'Cancelled PO', { id });
    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    logger.error('API:PurchaseOrders:Cancel', 'Failed to cancel PO', { error });
    logApiError('API:PurchaseOrders:Cancel', error);
    return createErrorResponse('Eroare la anularea comenzii', 500);
  }
}
