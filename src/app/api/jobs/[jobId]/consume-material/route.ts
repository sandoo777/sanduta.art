import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { calculateMaterialConsumption, normalizeMaterialUnit, toAreaM2 } from '@/modules/materials/inventory';

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
    const { jobId } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const materialId = typeof body.materialId === 'string' ? body.materialId : null;
    const formatId = body.formatId && typeof body.formatId === 'string' ? body.formatId : null;
    const widthMm = asNumber(body.width_mm);
    const heightMm = asNumber(body.height_mm);
    const lengthMm = asNumber(body.length_mm);
    const requestedQuantity = asNumber(body.quantity);
    const requestedUnit = typeof body.unit === 'string' ? body.unit : null;

    if (!materialId) {
      return createErrorResponse('Material ID este obligatoriu', 400);
    }

    if (!jobId) {
      return createErrorResponse('Job ID este obligatoriu', 400);
    }

    if (requestedQuantity !== null && requestedQuantity <= 0) {
      return createErrorResponse('Cantitatea trebuie să fie pozitivă', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.productionJob.findUnique({ where: { id: jobId } });
      if (!job) {
        throw new Error('Job not found');
      }

      const material = await tx.material.findUnique({
        where: { id: materialId },
        include: { format: true },
      });

      if (!material) {
        throw new Error('Material not found');
      }

      let effectiveWidth = widthMm ?? material.width_mm ?? null;
      let effectiveHeight = heightMm ?? material.height_mm ?? null;
      let effectiveFormatId = formatId ?? material.formatId ?? null;

      if (formatId) {
        const format = await tx.format.findUnique({ where: { id: formatId } });
        if (!format) {
          throw new Error('Format not found');
        }
        effectiveFormatId = format.id;
        if (effectiveWidth === null && format.width_mm !== null) effectiveWidth = format.width_mm;
        if (effectiveHeight === null && format.height_mm !== null) effectiveHeight = format.height_mm;
      }

      if (effectiveWidth === null || effectiveWidth <= 0) {
        throw new Error('Lățimea este obligatorie');
      }

      if (material.materialType === 'SUPORT_FOI' && (effectiveHeight === null || effectiveHeight <= 0)) {
        throw new Error('Înălțimea este obligatorie pentru foi');
      }

      const unit = normalizeMaterialUnit(requestedUnit ?? material.unit ?? 'unit');
      const computation = calculateMaterialConsumption({
        materialType: material.materialType ?? undefined,
        width_mm: effectiveWidth,
        height_mm: effectiveHeight,
        length_mm: lengthMm ?? null,
        quantity: requestedQuantity ?? null,
        unit,
        consumptionRate: material.consumptionRate ?? null,
      });

      let consumed = computation.consumed;
      if (requestedQuantity !== null) {
        consumed = requestedQuantity;
      }

      const inventory = await tx.inventoryItem.upsert({
        where: { materialId },
        update: {},
        create: {
          materialId,
          quantity: 0,
          unit: normalizeMaterialUnit(material.unit ?? 'unit'),
          costPerUnit: new Prisma.Decimal(String(Number(material.purchasePrice ?? 0))),
        },
      });

      const currentQuantity = Number(inventory.quantity ?? 0);
      if (currentQuantity < consumed) {
        return {
          status: 409,
          payload: {
            ok: false,
            errors: [{ field: 'inventory', message: 'Insufficient stock' }],
          },
        };
      }

      const remainingQuantity = currentQuantity - consumed;
      const costPerUnit = Number(inventory.costPerUnit ?? 0);
      const cost = consumed * costPerUnit;

      const usage = await tx.jobMaterialUsage.create({
        data: {
          jobId,
          materialId,
          formatId: effectiveFormatId,
          width_mm: effectiveWidth ?? null,
          height_mm: effectiveHeight ?? null,
          area_m2: computation.area_m2,
          length_m: computation.length_m,
          quantityUsed: consumed,
          unit: computation.unit,
          cost: new Prisma.Decimal(cost.toFixed(2)),
        },
      });

      const updated = await tx.inventoryItem.update({
        where: { materialId },
        data: {
          quantity: remainingQuantity,
          unit: normalizeMaterialUnit(material.unit ?? 'unit'),
          costPerUnit: new Prisma.Decimal(String(costPerUnit)),
        },
      });

      return {
        ok: true,
        usage: {
          id: usage.id,
          consumed,
          unit: computation.unit,
          cost: Number(usage.cost),
          remainingInventory: Number(updated.quantity),
        },
      };
    });

    if ('status' in result && result.status === 409) {
      return NextResponse.json(result.payload, { status: 409 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('API:Jobs:ConsumeMaterial', 'Failed to consume material', { error, jobId });

    if (error instanceof Error && error.message === 'Material not found') {
      return createErrorResponse('Materialul nu a fost găsit', 404);
    }

    if (error instanceof Error && error.message === 'Job not found') {
      return createErrorResponse('Job-ul nu a fost găsit', 404);
    }

    if (error instanceof Error && error.message === 'Format not found') {
      return createErrorResponse('Formatul nu a fost găsit', 404);
    }

    if (error instanceof Error && /obligatorie|positive|must be/i.test(error.message)) {
      return createErrorResponse(error.message, 400);
    }

    logApiError('API:Jobs:ConsumeMaterial', error);
    return createErrorResponse('Eroare la consumul materialului', 500);
  }
}
