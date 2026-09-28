import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';

export async function GET() {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const items = await prisma.reorderRule.findMany({
      include: { supplier: true, material: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    logger.error('API:ReorderRules', 'Failed to fetch reorder rules', { error });
    logApiError('API:ReorderRules', error);
    return createErrorResponse('Eroare la încărcarea regulilor de re-order', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const materialId = typeof body.materialId === 'string' ? body.materialId : null;
    const supplierId = typeof body.supplierId === 'string' ? body.supplierId : null;
    const minThreshold = Number(body.minThreshold ?? 0);
    const reorderQuantity = Number(body.reorderQuantity ?? 0);

    if (!materialId || !supplierId || minThreshold <= 0 || reorderQuantity <= 0) {
      return createErrorResponse('materialId, supplierId, minThreshold și reorderQuantity sunt obligatorii', 400);
    }

    const item = await prisma.reorderRule.create({
      data: {
        materialId,
        supplierId,
        minThreshold,
        reorderQuantity,
        enabled: body.enabled !== false,
        createdBy: user.id,
      },
      include: { supplier: true, material: true },
    });

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    logApiError('API:ReorderRules', error);
    return createErrorResponse('Eroare la crearea regulii de re-order', 500);
  }
}
