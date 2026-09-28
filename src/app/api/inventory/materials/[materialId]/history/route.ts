import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError } from '@/lib/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const { materialId } = await params;
    const usages = await prisma.jobMaterialUsage.findMany({
      where: { materialId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobId: true,
        materialId: true,
        formatId: true,
        width_mm: true,
        height_mm: true,
        area_m2: true,
        length_m: true,
        quantityUsed: true,
        unit: true,
        cost: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      items: usages.map((entry) => ({
        ...entry,
        cost: Number(entry.cost),
      })),
    });
  } catch (error) {
    logApiError('API:Inventory:MaterialHistory', error);
    return createErrorResponse('Eroare la încărcarea istoricului de consum', 500);
  }
}
