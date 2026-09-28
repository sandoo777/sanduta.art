import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { applyPoStatusTransition } from '@/modules/purchasing/reorder';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, lines: true },
    });

    if (!po) {
      return createErrorResponse('PO-ul nu a fost găsit', 404);
    }

    const nextStatus = applyPoStatusTransition(po.status as any, 'approve');
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: nextStatus,
        createdBy: user.id,
      },
    });

    await prisma.purchaseOrderEvent.create({
      data: {
        purchaseOrderId: id,
        eventType: 'APPROVED',
        message: `PO approved by ${user.email}`,
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    logger.error('API:PurchaseOrders:Approve', 'Failed to approve PO', { error });
    logApiError('API:PurchaseOrders:Approve', error);
    return createErrorResponse('Eroare la aprobarea comenzii', 500);
  }
}
