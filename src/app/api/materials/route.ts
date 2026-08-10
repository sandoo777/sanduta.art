import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { createMaterial, getCompatibleMaterials, listMaterials, MaterialApiValidationError } from '@/modules/materials/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const printMethodId = searchParams.get('printMethodId') ?? undefined;
    const equipmentId = searchParams.get('equipmentId') ?? undefined;

    const materials = printMethodId || equipmentId
      ? await getCompatibleMaterials({ printMethodId, equipmentId })
      : await listMaterials();
    return NextResponse.json(materials);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Materials:Public', error);
    return createErrorResponse('Failed to fetch materials', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    logger.info('API:Materials', 'Creating material', { userId: user.id });

    const material = await createMaterial(body);
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Materials', error);
    return createErrorResponse('Failed to create material', 500);
  }
}