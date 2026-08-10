import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { getCategoryBreadcrumb } from '@/modules/material-categories';

/**
 * GET /api/admin/material-categories/[id]/breadcrumb
 * Get the full breadcrumb path for a category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    
    logger.info('API:Admin:MaterialCategories', 'Fetching breadcrumb', { 
      userId: user.id,
      categoryId: id,
    });
    
    const breadcrumb = await getCategoryBreadcrumb(id);
    
    return NextResponse.json({ breadcrumb });
  } catch (error) {
    logApiError('API:Admin:MaterialCategories', error);
    return createErrorResponse('Eroare la preluarea căii categoriei', 500);
  }
}
