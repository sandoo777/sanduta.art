import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string; attrId: string }> };

/** PUT /api/admin/products/[id]/attributes/[attrId] */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id, attrId } = await params;
    const body = await req.json() as {
      name?: string;
      label?: string;
      type?: 'SELECT' | 'MULTISELECT' | 'NUMBER' | 'TOGGLE';
      required?: boolean;
      helpText?: string;
      sortOrder?: number;
    };

    const existing = await prisma.productAttribute.findFirst({ where: { id: attrId, productId: id } });
    if (!existing) return createErrorResponse('Atribut negăsit', 404);

    const updated = await prisma.productAttribute.update({
      where: { id: attrId },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.label !== undefined && { label: body.label.trim() }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.required !== undefined && { required: body.required }),
        ...(body.helpText !== undefined && { helpText: body.helpText?.trim() || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });

    logger.info('API:ProductAttributes', 'Updated attribute', { attrId });
    return NextResponse.json(updated);
  } catch (err) {
    logApiError('API:ProductAttributes', err);
    return createErrorResponse('Eroare la actualizarea atributului', 500);
  }
}

/** DELETE /api/admin/products/[id]/attributes/[attrId] */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id, attrId } = await params;
    const existing = await prisma.productAttribute.findFirst({ where: { id: attrId, productId: id } });
    if (!existing) return createErrorResponse('Atribut negăsit', 404);

    await prisma.productAttribute.delete({ where: { id: attrId } });
    logger.info('API:ProductAttributes', 'Deleted attribute', { attrId });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logApiError('API:ProductAttributes', err);
    return createErrorResponse('Eroare la ștergerea atributului', 500);
  }
}
