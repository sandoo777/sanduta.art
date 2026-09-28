import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { applyPoStatusTransition } from '@/modules/purchasing/reorder';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const receivedQuantities = body.receivedQuantities ?? [];

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!po) {
      return createErrorResponse('PO-ul nu a fost găsit', 404);
    }

    for (const item of receivedQuantities as Array<{ materialId: string; quantity: number }>) {
      const inventoryItem = await prisma.inventoryItem.upsert({
        where: { materialId: item.materialId },
        update: {
          quantity: { increment: Number(item.quantity ?? 0) },
        },
        create: {
          materialId: item.materialId,
          quantity: Number(item.quantity ?? 0),
          unit: 'unit',
          costPerUnit: 0,
        },
      });

      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: Number(inventoryItem.quantity) + Number(item.quantity ?? 0),
        },
      });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: applyPoStatusTransition(po.status as any, 'receive'),
      },
    });

    await prisma.purchaseOrderEvent.create({
      data: {
        purchaseOrderId: id,
        eventType: 'RECEIVED',
        message: `PO marked as received; inventory updated by ${receivedQuantities.length} line(s)`,
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    logger.error('API:PurchaseOrders:Receive', 'Failed to receive PO', { error });
    logApiError('API:PurchaseOrders:Receive', error);
    return createErrorResponse('Eroare la confirmarea primirii comenzii', 500);
  }
}
