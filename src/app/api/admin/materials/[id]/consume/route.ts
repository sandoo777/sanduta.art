import { MaterialUnit, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { calculateConsumptionCost, convertMaterialQuantity } from '@/modules/materials/pricing';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/materials/[id]/consume
 * Consume material for a production job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    const { jobId, quantity, unit, rollWidthMeters } = body as {
      jobId?: unknown;
      quantity?: unknown;
      unit?: unknown;
      rollWidthMeters?: unknown;
    };

    if (!jobId || typeof jobId !== 'string') {
      return createErrorResponse('ID-ul job-ului este obligatoriu', 400);
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return createErrorResponse('Cantitatea trebuie să fie un număr pozitiv', 400);
    }

    const requestedUnit = typeof unit === 'string' ? unit.trim() : '';
    if (requestedUnit && !(Object.values(MaterialUnit) as string[]).includes(requestedUnit)) {
      return createErrorResponse('Unitatea de consum este invalidă', 400);
    }

    const width = typeof rollWidthMeters === 'number' ? rollWidthMeters : undefined;
    if (width !== undefined && width <= 0) {
      return createErrorResponse('Lățimea rolei trebuie să fie un număr pozitiv', 400);
    }

    logger.info('API:Admin:Materials:Consume', 'Consuming material', {
      userId: user.id,
      materialId: id,
      jobId,
      quantity,
      unit: requestedUnit || null,
    });

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            requiresPricePerSqm: true,
            requiresPricePerMeter: true,
            requiresPricePerUnit: true,
          },
        },
      },
    });

    if (!material) {
      return createErrorResponse('Materialul nu a fost găsit', 404);
    }

    const job = await prisma.productionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return createErrorResponse('Job-ul de producție nu a fost găsit', 404);
    }

    const usageUnit = requestedUnit ? (requestedUnit as MaterialUnit) : material.unit;

    let quantityInStockUnit: number;
    try {
      quantityInStockUnit = convertMaterialQuantity(quantity, usageUnit, material.unit, {
        rollWidthMeters: width,
      });
    } catch (conversionError) {
      const message = conversionError instanceof Error ? conversionError.message : 'Conversie invalidă';
      return createErrorResponse(message, 400);
    }

    if (material.stock < quantityInStockUnit) {
      return NextResponse.json(
        {
          error: 'Stoc insuficient',
          available: material.stock,
          requested: quantityInStockUnit,
          requestedRaw: quantity,
          requestedUnit: usageUnit,
          stockUnit: material.unit,
        },
        { status: 400 }
      );
    }

    const pricingUnit =
      material.consumptionType === 'AREA_BASED'
        ? material.category.requiresPricePerSqm
          ? MaterialUnit.m2
          : material.category.requiresPricePerMeter
            ? MaterialUnit.meter
            : MaterialUnit.unit
        : material.unit;

    let quantityForPricing: number;
    try {
      quantityForPricing = convertMaterialQuantity(quantity, usageUnit, pricingUnit, {
        rollWidthMeters: width,
      });
    } catch (conversionError) {
      const message = conversionError instanceof Error ? conversionError.message : 'Conversie invalidă pentru pricing';
      return createErrorResponse(message, 400);
    }

    let pricing;
    try {
      pricing = calculateConsumptionCost(quantityForPricing, {
        consumptionType: material.consumptionType,
        purchasePrice: material.purchasePrice ? Number(material.purchasePrice) : null,
        salePrice: material.salePrice ? Number(material.salePrice) : null,
        wastePercent: material.wastePercent,
      });
    } catch (pricingError) {
      const message = pricingError instanceof Error ? pricingError.message : 'Configurare preț invalidă';
      return createErrorResponse(message, 400);
    }

    const totalUsedInStockUnit = convertMaterialQuantity(
      pricing.totalUsed,
      pricingUnit,
      material.unit,
      { rollWidthMeters: width }
    );
    const newStock = material.stock - totalUsedInStockUnit;

    const result = await prisma.$transaction([
      prisma.materialUsage.create({
        data: {
          materialId: id,
          jobId,
          quantity,
          unit: usageUnit,
          wastePercent: pricing.effectiveWastePercent,
          totalUsed: pricing.totalUsed,
          cost: new Prisma.Decimal(pricing.totalCost),
        },
      }),
      prisma.material.update({
        where: { id },
        data: { stock: newStock },
      }),
    ]);

    const [materialUsage, updatedMaterial] = result;

    const lowStockWarning = newStock < material.minStock;

    return NextResponse.json({
      success: true,
      materialUsage,
      material: updatedMaterial,
      pricing: {
        unitPrice: pricing.unitPrice,
        pricingUnit,
        usageUnit,
        quantityForPricing,
        totalUsedInStockUnit,
        totalCost: pricing.totalCost,
      },
      warning: lowStockWarning ? {
        message: 'Atenție: Stocul este sub pragul minim!',
        currentStock: newStock,
        minStock: material.minStock,
      } : null,
    });
  } catch (error) {
    logApiError('API:Admin:Materials:Consume', error);
    return createErrorResponse('Eroare la consumul materialului', 500);
  }
}
