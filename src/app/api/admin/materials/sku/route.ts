import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { getNextMaterialSku, MaterialApiValidationError } from '@/modules/materials/server';

/**
 * GET /api/admin/materials/sku?categoryId=...
 * Returns next auto-generated SKU for a category.
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') ?? '';

    logger.info('API:Admin:Materials', 'Generating next SKU', { userId: user.id, categoryId });
    const result = await getNextMaterialSku(categoryId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials', error);
    return createErrorResponse('Eroare la generarea SKU-ului', 500);
  }
}
