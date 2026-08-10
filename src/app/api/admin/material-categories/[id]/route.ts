import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import {
  getMaterialCategoryById,
  updateMaterialCategory,
  deleteMaterialCategory,
  MaterialCategoryValidationError,
} from '@/modules/material-categories';

/**
 * GET /api/admin/material-categories/[id]
 * Get a single material category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    
    logger.info('API:Admin:MaterialCategories', 'Fetching category', { 
      userId: user.id,
      categoryId: id,
    });
    
    const category = await getMaterialCategoryById(id);
    
    if (!category) {
      return createErrorResponse('Categoria nu a fost găsită', 404);
    }
    
    return NextResponse.json(category);
  } catch (error) {
    logApiError('API:Admin:MaterialCategories', error);
    return createErrorResponse('Eroare la preluarea categoriei', 500);
  }
}

/**
 * PUT /api/admin/material-categories/[id]
 * Update a material category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    
    logger.info('API:Admin:MaterialCategories', 'Updating category', { 
      userId: user.id,
      categoryId: id,
    });
    
    const category = await updateMaterialCategory(id, body);
    
    logger.info('API:Admin:MaterialCategories', 'Category updated', { 
      categoryId: category.id,
      name: category.name,
    });
    
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof MaterialCategoryValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:MaterialCategories', error);
    return createErrorResponse('Eroare la actualizarea categoriei', 500);
  }
}

/**
 * DELETE /api/admin/material-categories/[id]
 * Delete a material category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    
    logger.info('API:Admin:MaterialCategories', 'Deleting category', { 
      userId: user.id,
      categoryId: id,
    });
    
    await deleteMaterialCategory(id);
    
    logger.info('API:Admin:MaterialCategories', 'Category deleted', { 
      categoryId: id,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MaterialCategoryValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:MaterialCategories', error);
    return createErrorResponse('Eroare la ștergerea categoriei', 500);
  }
}
