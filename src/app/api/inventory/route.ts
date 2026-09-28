import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';

    const items = await prisma.inventoryItem.findMany({
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
            minStock: true,
            materialType: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const normalizedItems = items
      .filter((item) => !lowStockOnly || Number(item.quantity) <= Number(item.material.minStock || 0))
      .map((item) => ({
        id: item.id,
        materialId: item.materialId,
        materialName: item.material?.name ?? 'Material',
        materialUnit: item.material?.unit ?? item.unit,
        quantity: Number(item.quantity),
        unit: item.unit,
        costPerUnit: Number(item.costPerUnit),
        minStock: Number(item.material?.minStock ?? 0),
        materialType: item.material?.materialType ?? null,
        updatedAt: item.updatedAt.toISOString(),
        isLowStock: Number(item.quantity) <= Number(item.material?.minStock ?? 0),
      }));

    const summary = {
      total: normalizedItems.length,
      lowStock: normalizedItems.filter((item) => item.isLowStock).length,
      outOfStock: normalizedItems.filter((item) => Number(item.quantity) === 0).length,
      totalValue: normalizedItems.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0),
    };

    return NextResponse.json({ ok: true, items: normalizedItems, summary });
  } catch (error) {
    logApiError('API:Inventory:List', error);
    return createErrorResponse('Eroare la încărcarea inventarului', 500);
  }
}
