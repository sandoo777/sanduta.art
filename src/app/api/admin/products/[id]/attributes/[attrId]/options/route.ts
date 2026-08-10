import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string; attrId: string }> };

/** GET /api/admin/products/[id]/attributes/[attrId]/options */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id, attrId } = await params;
    const attr = await prisma.productAttribute.findFirst({ where: { id: attrId, productId: id } });
    if (!attr) return createErrorResponse('Atribut negăsit', 404);

    const options = await prisma.productAttributeOption.findMany({
      where: { attributeId: attrId },
      orderBy: { sortOrder: 'asc' },
      include: { material: { select: { id: true, name: true, finishType: true, unit: true } } },
    });

    return NextResponse.json(options);
  } catch (err) {
    logApiError('API:ProductAttributeOptions', err);
    return createErrorResponse('Eroare la preluarea opțiunilor', 500);
  }
}

/** POST /api/admin/products/[id]/attributes/[attrId]/options */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id, attrId } = await params;
    const attr = await prisma.productAttribute.findFirst({ where: { id: attrId, productId: id } });
    if (!attr) return createErrorResponse('Atribut negăsit', 404);

    const body = await req.json() as {
      label: string;
      value: string;
      description?: string;
      priceModifier?: number;
      priceModifierType?: 'FIXED' | 'PERCENT' | 'PER_SQM' | 'REPLACE';
      materialId?: string;
      sortOrder?: number;
      isDefault?: boolean;
    };

    if (!body.label?.trim() || !body.value?.trim()) {
      return createErrorResponse('label și value sunt obligatorii', 400);
    }

    const option = await prisma.productAttributeOption.create({
      data: {
        attributeId: attrId,
        label: body.label.trim(),
        value: body.value.trim(),
        description: body.description?.trim() || null,
        priceModifier: body.priceModifier ?? 0,
        priceModifierType: body.priceModifierType ?? 'FIXED',
        materialId: body.materialId || null,
        sortOrder: body.sortOrder ?? 0,
        isDefault: body.isDefault ?? false,
      },
      include: { material: { select: { id: true, name: true, finishType: true, unit: true } } },
    });

    logger.info('API:ProductAttributeOptions', 'Created option', { attrId, optionId: option.id });
    return NextResponse.json(option, { status: 201 });
  } catch (err) {
    logApiError('API:ProductAttributeOptions', err);
    return createErrorResponse('Eroare la crearea opțiunii', 500);
  }
}
