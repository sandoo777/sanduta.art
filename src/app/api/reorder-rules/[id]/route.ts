import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const item = await prisma.reorderRule.update({
      where: { id },
      data: {
        ...(typeof body.minThreshold === 'number' ? { minThreshold: body.minThreshold } : {}),
        ...(typeof body.reorderQuantity === 'number' ? { reorderQuantity: body.reorderQuantity } : {}),
        ...(typeof body.enabled === 'boolean' ? { enabled: body.enabled } : {}),
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    logApiError('API:ReorderRules', error);
    return createErrorResponse('Eroare la actualizarea regulii de re-order', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    await prisma.reorderRule.delete({ where: { id } });
    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    logApiError('API:ReorderRules', error);
    return createErrorResponse('Eroare la ștergerea regulii de re-order', 500);
  }
}
