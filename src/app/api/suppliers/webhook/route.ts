import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const poNumber = typeof payload.poNumber === 'string' ? payload.poNumber : null;
    const supplierId = typeof payload.supplierId === 'string' ? payload.supplierId : null;

    if (!poNumber && !supplierId) {
      return createErrorResponse('poNumber or supplierId required', 400);
    }

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: poNumber ? { poNumber } : { supplierId },
      include: { supplier: true },
    });

    if (purchaseOrder) {
      await prisma.purchaseOrderEvent.create({
        data: {
          purchaseOrderId: purchaseOrder.id,
          eventType: 'SUPPLIER_WEBHOOK',
          message: 'Supplier webhook received',
          metadata: payload,
        },
      });
    }

    logger.info('API:Suppliers:Webhook', 'Supplier webhook received', { poNumber, supplierId });
    return NextResponse.json({ ok: true, received: !!purchaseOrder });
  } catch (error) {
    logApiError('API:Suppliers:Webhook', error);
    return createErrorResponse('Eroare la procesarea webhook-ului furnizorului', 500);
  }
}
