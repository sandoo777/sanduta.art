import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string; attrId: string; optId: string }> };

/** PUT /api/admin/products/[id]/attributes/[attrId]/options/[optId] */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { attrId, optId } = await params;
    const existing = await prisma.productAttributeOption.findFirst({ where: { id: optId, attributeId: attrId } });
    if (!existing) return createErrorResponse('Opțiune negăsită', 404);

    const body = await req.json() as {
      label?: string;
      value?: string;
      description?: string;
      priceModifier?: number;
      priceModifierType?: 'FIXED' | 'PERCENT' | 'PER_SQM' | 'REPLACE';
      materialId?: string | null;
      sortOrder?: number;
      isDefault?: boolean;
      active?: boolean;
    };

    const updated = await prisma.productAttributeOption.update({
      where: { id: optId },
      data: {
        ...(body.label !== undefined && { label: body.label.trim() }),
        ...(body.value !== undefined && { value: body.value.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.priceModifier !== undefined && { priceModifier: body.priceModifier }),
        ...(body.priceModifierType !== undefined && { priceModifierType: body.priceModifierType }),
        ...(body.materialId !== undefined && { materialId: body.materialId || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
        ...(body.active !== undefined && { active: body.active }),
      },
      include: { material: { select: { id: true, name: true, finishType: true, unit: true } } },
    });

    logger.info('API:ProductAttributeOptions', 'Updated option', { optId });
    return NextResponse.json(updated);
  } catch (err) {
    logApiError('API:ProductAttributeOptions', err);
    return createErrorResponse('Eroare la actualizarea opțiunii', 500);
  }
}

/** DELETE /api/admin/products/[id]/attributes/[attrId]/options/[optId] */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { attrId, optId } = await params;
    const existing = await prisma.productAttributeOption.findFirst({ where: { id: optId, attributeId: attrId } });
    if (!existing) return createErrorResponse('Opțiune negăsită', 404);

    await prisma.productAttributeOption.delete({ where: { id: optId } });
    logger.info('API:ProductAttributeOptions', 'Deleted option', { optId });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logApiError('API:ProductAttributeOptions', err);
    return createErrorResponse('Eroare la ștergerea opțiunii', 500);
  }
}
