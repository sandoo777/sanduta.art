import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/** GET /api/admin/products/[id]/attributes */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const attributes = await prisma.productAttribute.findMany({
      where: { productId: id },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
          include: { material: { select: { id: true, name: true, finishType: true, unit: true } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(attributes);
  } catch (err) {
    logApiError('API:ProductAttributes', err);
    return createErrorResponse('Eroare la preluarea atributelor', 500);
  }
}

/** POST /api/admin/products/[id]/attributes */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const body = await req.json() as {
      name: string;
      label: string;
      type?: 'SELECT' | 'MULTISELECT' | 'NUMBER' | 'TOGGLE';
      required?: boolean;
      helpText?: string;
      sortOrder?: number;
    };

    if (!body.name?.trim() || !body.label?.trim()) {
      return createErrorResponse('name și label sunt obligatorii', 400);
    }

    const attr = await prisma.productAttribute.create({
      data: {
        productId: id,
        name: body.name.trim(),
        label: body.label.trim(),
        type: body.type ?? 'SELECT',
        required: body.required ?? true,
        helpText: body.helpText?.trim() || null,
        sortOrder: body.sortOrder ?? 0,
      },
      include: { options: true },
    });

    logger.info('API:ProductAttributes', 'Created attribute', { productId: id, attrId: attr.id });
    return NextResponse.json(attr, { status: 201 });
  } catch (err) {
    logApiError('API:ProductAttributes', err);
    return createErrorResponse('Eroare la crearea atributului', 500);
  }
}
