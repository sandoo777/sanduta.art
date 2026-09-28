import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { getMaterialById, MaterialApiValidationError } from '@/modules/materials/server';
import { prisma } from '@/lib/prisma';

async function buildUniqueCopyName(sourceName: string): Promise<string> {
  const base = sourceName.trim();
  const initial = `${base} (copy)`;

  const initialExists = await prisma.material.findFirst({
    where: { name: initial },
    select: { id: true },
  });

  if (!initialExists) {
    return initial;
  }

  for (let index = 2; index <= 5000; index += 1) {
    const candidate = `${base} (copy ${index})`;
    const exists = await prisma.material.findFirst({
      where: { name: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }

  throw new MaterialApiValidationError('Nu am putut genera un nume unic pentru copia materialului', 500);
}

/**
 * POST /api/admin/materials/[id]/copy
 * Returns a full copy draft of a material (all editable fields), leaving SKU creation
 * and persistence to the MaterialForm submit flow.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Admin:Materials:Copy', 'Copying material', {
      userId: user.id,
      materialId: id,
    });

    const original = await getMaterialById(id);
    if (!original) {
      return createErrorResponse('Materialul sursă nu a fost găsit', 404);
    }

    const uniqueCopyName = await buildUniqueCopyName(original.name);

    const payload = {
      name: uniqueCopyName,
      categoryId: original.categoryId,
      consumptionType: original.consumptionType,
      active: original.active,
      unit: original.unit,
      stock: original.stock,
      minStock: original.minStock,
      purchasePrice: original.purchasePrice,
      salePrice: original.salePrice,
      salePriceMode: original.salePriceMode,
      salePricePercent: original.salePricePercent,
      minimumMarginPercent: original.minimumMarginPercent,
      wastePercent: original.wastePercent,
      thickness: original.thickness,
      density: original.density,
      formatId: original.formatId ?? null,
      formatName: original.formatName ?? null,
      width_mm: original.width_mm ?? null,
      height_mm: original.height_mm ?? null,
      colorName: original.colorName ?? null,
      colorCode: original.colorCode ?? null,
      thumbnailUrl: original.thumbnailUrl ?? original.thumbnailImage ?? null,
      macroTextureUrl: original.macroTextureUrl ?? original.macroTextureImage ?? null,
      finishType: original.finishType ?? null,
      texture: original.texture ?? null,
      packagingLabel: original.packagingLabel ?? null,
      packagingQty: original.packagingQty ?? null,
      packagingPrice: original.packagingPrice ?? null,
      properties: original.properties
        ? JSON.parse(JSON.stringify(original.properties)) as Record<string, unknown>
        : null,
      materialType: original.materialType ?? null,
      consumptionRate: original.consumptionRate ?? null,
      isTemplate: original.isTemplate,
      primarySupplierId: original.primarySupplierId ?? null,
      suppliers: (original.suppliers ?? []).map((supplier) => ({ supplierId: supplier.supplierId })),
      priceBreaks: (original.priceBreaks ?? []).map((row) => ({
        qtyMin: row.qtyMin,
        qtyMax: row.qtyMax,
        price: row.price,
        discount: row.discount ?? null,
      })),
      printMethodIds: original.printMethodIds ?? original.printMethods?.map((method) => method.id) ?? [],
      notes: original.notes ?? undefined,
      sku: null,
      // Intentionally no `id`, `createdAt`, `updatedAt`.
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return error.errors.length > 0
        ? NextResponse.json(error.errors, { status: error.status })
        : createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials:Copy', error);
    return createErrorResponse('Eroare la copierea materialului', 500);
  }
}
