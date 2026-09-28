import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError } from '@/lib/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const { materialId } = await params;
    const item = await prisma.inventoryItem.findUnique({
      where: { materialId },
    });

    if (!item) {
      return createErrorResponse('Inventarul pentru materialul selectat nu există', 404);
    }

    return NextResponse.json({
      ok: true,
      item: {
        id: item.id,
        materialId: item.materialId,
        quantity: Number(item.quantity),
        unit: item.unit,
        costPerUnit: Number(item.costPerUnit),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logApiError('API:Inventory:Material', error);
    return createErrorResponse('Eroare la încărcarea inventarului', 500);
  }
}
