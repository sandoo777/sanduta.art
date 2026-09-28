import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError } from '@/lib/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { jobId } = await params;

    const items = await prisma.jobMaterialUsage.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      items: items.map((item) => ({
        id: item.id,
        jobId: item.jobId,
        materialId: item.materialId,
        materialName: item.material?.name ?? 'Material',
        materialUnit: item.material?.unit ?? item.unit,
        formatId: item.formatId,
        width_mm: item.width_mm,
        height_mm: item.height_mm,
        area_m2: item.area_m2,
        length_m: item.length_m,
        quantityUsed: Number(item.quantityUsed),
        unit: item.unit,
        cost: Number(item.cost),
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logApiError('API:Jobs:Usage', error);
    return createErrorResponse('Eroare la încărcarea istoricului de consum', 500);
  }
}
