import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { calculateMaterialConsumption, normalizeMaterialUnit } from '@/modules/materials/inventory';

const asNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { jobId } = await params;
    const body = await request.json().catch(() => ({}));

    const materialId = typeof body.materialId === 'string' ? body.materialId : null;
    const formatId = body.formatId && typeof body.formatId === 'string' ? body.formatId : null;
    const widthMm = asNumber(body.width_mm);
    const heightMm = asNumber(body.height_mm);
    const lengthMm = asNumber(body.length_mm);
    const requestedQuantity = asNumber(body.quantity);
    const requestedUnit = typeof body.unit === 'string' ? body.unit : null;

    if (!jobId) {
      return createErrorResponse('Job ID este obligatoriu', 400);
    }

    if (!materialId) {
      return createErrorResponse('Material ID este obligatoriu', 400);
    }

    const [job, material] = await Promise.all([
      prisma.productionJob.findUnique({ where: { id: jobId } }),
      prisma.material.findUnique({
        where: { id: materialId },
        include: { format: true },
      }),
    ]);

    if (!job) {
      return createErrorResponse('Job-ul nu a fost găsit', 404);
    }

    if (!material) {
      return createErrorResponse('Materialul nu a fost găsit', 404);
    }

    let effectiveWidth = widthMm ?? material.width_mm ?? null;
    let effectiveHeight = heightMm ?? material.height_mm ?? null;

    if (formatId) {
      const format = await prisma.format.findUnique({ where: { id: formatId } });
      if (!format) {
        return createErrorResponse('Formatul nu a fost găsit', 404);
      }
      effectiveWidth ??= format.width_mm ?? null;
      effectiveHeight ??= format.height_mm ?? null;
    }

    if (effectiveWidth === null || effectiveWidth <= 0) {
      return createErrorResponse('Lățimea este obligatorie', 400);
    }

    if (material.materialType === 'SUPORT_FOI' && (effectiveHeight === null || effectiveHeight <= 0)) {
      return createErrorResponse('Înălțimea este obligatorie pentru foi', 400);
    }

    const unit = normalizeMaterialUnit(requestedUnit ?? material.unit ?? 'unit');
    const calculation = calculateMaterialConsumption({
      materialType: material.materialType ?? undefined,
      width_mm: effectiveWidth,
      height_mm: effectiveHeight,
      length_mm: lengthMm ?? null,
      quantity: requestedQuantity ?? null,
      unit,
      consumptionRate: material.consumptionRate ?? null,
    });

    const quantity = requestedQuantity !== null ? requestedQuantity : calculation.consumed;
    const inventoryItem = await prisma.inventoryItem.findUnique({ where: { materialId } });

    return NextResponse.json({
      ok: true,
      preview: {
        materialId: material.id,
        materialName: material.name,
        quantity,
        unit: calculation.unit,
        area_m2: calculation.area_m2,
        length_m: calculation.length_m,
        available: inventoryItem ? Number(inventoryItem.quantity) : 0,
        shortage: inventoryItem ? Math.max(0, quantity - Number(inventoryItem.quantity)) : quantity,
      },
    });
  } catch (error) {
    logger.error('API:Jobs:PreviewConsume', 'Preview consumption failed', { error, userId: user?.id ?? null, jobId: (await params).jobId ?? null });
    logApiError('API:Jobs:PreviewConsume', error);
    return createErrorResponse('Eroare la previzualizarea consumului', 500);
  }
}
