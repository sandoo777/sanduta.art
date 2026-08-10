import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import {
  listMaterialCategories,
  createMaterialCategory,
  MaterialCategoryValidationError,
} from '@/modules/material-categories';

/**
 * GET /api/admin/material-categories
 * List all material categories (flat list)
 */
export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Admin:MaterialCategories', 'Fetching categories', { userId: user.id });
    
    const categories = await listMaterialCategories();
    
    return NextResponse.json(categories);
  } catch (error) {
    logApiError('API:Admin:MaterialCategories', error);
    return createErrorResponse('Eroare la preluarea categoriilor de materiale', 500);
  }
}

/**
 * POST /api/admin/material-categories
 * Create a new material category
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    
    logger.info('API:Admin:MaterialCategories', 'Creating category', { 
      userId: user.id,
      name: body.name,
    });
    
    const category = await createMaterialCategory(body);
    
    logger.info('API:Admin:MaterialCategories', 'Category created', { 
      categoryId: category.id,
      name: category.name,
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof MaterialCategoryValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:MaterialCategories', error);
    return createErrorResponse('Eroare la crearea categoriei', 500);
  }
}
