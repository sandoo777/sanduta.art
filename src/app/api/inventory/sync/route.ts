import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    const items = Array.isArray(payload) ? payload : payload && typeof payload === 'object' ? [payload] : [];

    if (items.length === 0) {
      return createErrorResponse('Niciun element de sincronizare nu a fost primit', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = [] as Array<{ materialId: string; quantity: number; costPerUnit: number; updatedAt: string }>;

      for (const item of items) {
        const materialId = typeof item?.materialId === 'string' ? item.materialId : null;
        const quantity = typeof item?.quantity === 'number' ? item.quantity : Number(item?.quantity ?? 0);
        const costPerUnit = typeof item?.costPerUnit === 'number' ? item.costPerUnit : Number(item?.costPerUnit ?? 0);

        if (!materialId) {
          continue;
        }

        const inventory = await tx.inventoryItem.upsert({
          where: { materialId },
          update: {
            quantity,
            costPerUnit: new Prisma.Decimal(String(costPerUnit)),
          },
          create: {
            materialId,
            quantity,
            unit: 'unit',
            costPerUnit: new Prisma.Decimal(String(costPerUnit)),
          },
        });

        updated.push({
          materialId: inventory.materialId,
          quantity: Number(inventory.quantity),
          costPerUnit: Number(inventory.costPerUnit),
          updatedAt: inventory.updatedAt.toISOString(),
        });
      }

      return updated;
    });

    return NextResponse.json({ ok: true, updated: result }, { status: 200 });
  } catch (error) {
    logApiError('API:Inventory:Sync', error);
    return createErrorResponse('Sincronizarea inventarului a eșuat', 500);
  }
}
