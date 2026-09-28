import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { evaluateReorderCandidates } from '@/modules/purchasing/reorder';

export async function POST(_request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const rules = await prisma.reorderRule.findMany({
      where: { enabled: true },
      include: { supplier: true, material: true },
    });

    const inventoryItems = await prisma.inventoryItem.findMany({
      include: { material: true },
    });

    const matches = evaluateReorderCandidates(
      rules.map((rule) => ({
        id: rule.id,
        materialId: rule.materialId,
        minThreshold: Number(rule.minThreshold ?? 0),
        reorderQuantity: Number(rule.reorderQuantity ?? 0),
        supplierId: rule.supplierId,
        enabled: rule.enabled,
      })),
      inventoryItems.map((item) => ({
        materialId: item.materialId,
        quantity: Number(item.quantity ?? 0),
        unit: item.unit,
      }))
    );

    const grouped = new Map<string, typeof matches>();
    for (const match of matches) {
      const existing = grouped.get(match.supplierId) ?? [];
      existing.push(match);
      grouped.set(match.supplierId, existing);
    }

    let created = 0;
    for (const [supplierId, supplierMatches] of grouped.entries()) {
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) continue;

      const now = new Date();
      const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let po = await prisma.purchaseOrder.findFirst({
        where: {
          supplierId,
          status: 'DRAFT',
          createdAt: { gte: windowStart },
        },
        include: { lines: true },
      });

      if (!po) {
        po = await prisma.purchaseOrder.create({
          data: {
            supplierId,
            createdBy: user.id,
            status: 'DRAFT',
            currency: supplier.defaultCurrency || 'MDL',
            totalCost: 0,
            expectedDeliveryDate: new Date(Date.now() + (supplier.defaultLeadTimeDays || 7) * 24 * 60 * 60 * 1000),
          },
        });
        created += 1;
      }

      for (const match of supplierMatches) {
        const line = await prisma.purchaseOrderLine.findFirst({
          where: { purchaseOrderId: po.id, materialId: match.materialId },
        });

        if (line) {
          await prisma.purchaseOrderLine.update({
            where: { id: line.id },
            data: {
              quantity: Number(line.quantity) + Number(match.reorderQuantity),
              unit: match.unit,
            },
          });
        } else {
          await prisma.purchaseOrderLine.create({
            data: {
              purchaseOrderId: po.id,
              materialId: match.materialId,
              quantity: Number(match.reorderQuantity),
              unit: match.unit,
              unitCost: 0,
              lineTotal: 0,
            },
          });
        }
      }

      await prisma.purchaseOrderEvent.create({
        data: {
          purchaseOrderId: po.id,
          eventType: 'REORDER_EVALUATED',
          message: `Reorder evaluation generated draft PO for ${supplier.name}`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Draft purchase order created',
          message: `A draft PO for ${supplier.name} was created automatically after stock review.`,
          link: `/admin/purchase-orders/${po.id}`,
        },
      });
    }

    return NextResponse.json({ ok: true, candidates: matches, created, evaluatedAt: new Date().toISOString() });
  } catch (error) {
    logger.error('API:Reorder:Evaluate', 'Reorder evaluation failed', { error });
    logApiError('API:Reorder:Evaluate', error);
    return createErrorResponse('Eroare la evaluarea re-orderului', 500);
  }
}

export async function GET() {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const rules = await prisma.reorderRule.findMany({ include: { supplier: true, material: true } });
    return NextResponse.json({ ok: true, rules });
  } catch (error) {
    logApiError('API:Reorder:Evaluate', error);
    return createErrorResponse('Eroare la listarea regulilor de reorder', 500);
  }
}
