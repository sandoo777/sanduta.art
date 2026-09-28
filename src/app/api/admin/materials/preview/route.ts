import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { MaterialApiValidationError, previewMaterial } from '@/modules/materials/server';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    logger.info('API:Admin:Materials:Preview', 'Calculating material preview', { userId: user.id });

    const result = previewMaterial(body);
    if (!result.ok) {
      return NextResponse.json(result.errors, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return error.errors.length > 0
        ? NextResponse.json(error.errors, { status: error.status })
        : createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials:Preview', error);
    return createErrorResponse('Eroare la calcularea preview-ului materialului', 500);
  }
}
