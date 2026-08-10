import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { getMaterialCategoriesTree } from '@/modules/material-categories';

/**
 * GET /api/admin/material-categories/tree
 * Get material categories as a nested tree structure
 */
export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Admin:MaterialCategories:Tree', 'Fetching category tree', { userId: user.id });
    
    const tree = await getMaterialCategoriesTree();
    
    return NextResponse.json(tree);
  } catch (error) {
    logApiError('API:Admin:MaterialCategories:Tree', error);
    return createErrorResponse('Eroare la preluarea arborelui de categorii', 500);
  }
}
