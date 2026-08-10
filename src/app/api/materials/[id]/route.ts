import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { deleteMaterial, getMaterialById, MaterialApiValidationError, updateMaterial } from '@/modules/materials/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = await getMaterialById(id);

    if (!material) {
      return createErrorResponse('Material not found', 404);
    }

    return NextResponse.json(material);
  } catch (error) {
    logApiError('API:Materials:Public', error);
    return createErrorResponse('Failed to fetch material', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    logger.info('API:Materials', 'Updating material', { userId: user.id, materialId: id });

    const material = await updateMaterial(id, body);
    return NextResponse.json(material);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Materials', error);
    return createErrorResponse('Failed to update material', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Materials', 'Deleting material', { userId: user.id, materialId: id });
    const result = await deleteMaterial(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Materials', error);
    return createErrorResponse('Failed to delete material', 500);
  }
}