import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { id } = await params;
    const item = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: { include: { material: true } },
        events: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!item) {
      return createErrorResponse('Purchase order not found', 404);
    }

    return NextResponse.json({
      ok: true,
      item: {
        ...item,
        totalCost: Number(item.totalCost),
        lines: item.lines.map((line) => ({
          ...line,
          unitCost: Number(line.unitCost),
          lineTotal: Number(line.lineTotal),
        })),
      },
    });
  } catch (error) {
    logger.error('API:PurchaseOrders:Detail', 'Failed to fetch purchase order detail', { error });
    logApiError('API:PurchaseOrders:Detail', error);
    return createErrorResponse('Eroare la încărcarea detaliului comenzii', 500);
  }
}
