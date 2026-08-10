import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { createErrorResponse, logApiError, logger } from "@/lib/logger";
import { deleteMaterial, getMaterialById, MaterialApiValidationError, updateMaterial } from "@/modules/materials/server";

/**
 * GET /api/admin/materials/[id]
 * Get a single material with consumption history
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Admin:Materials', 'Fetching material detail', { userId: user.id, materialId: id });
    const material = await getMaterialById(id);

    if (!material) {
      return createErrorResponse('Materialul nu a fost găsit', 404);
    }

    return NextResponse.json(material);
  } catch (error) {
    logApiError('API:Admin:Materials', error);
    return createErrorResponse('Eroare la preluarea materialului', 500);
  }
}

/**
 * PUT /api/admin/materials/[id]
 * Update a material
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    logger.info('API:Admin:Materials', 'Updating material', { userId: user.id, materialId: id });
    const material = await updateMaterial(id, body);

    return NextResponse.json(material);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials', error);
    return createErrorResponse('Eroare la actualizarea materialului', 500);
  }
}

export const PATCH = PUT;

/**
 * DELETE /api/admin/materials/[id]
 * Delete a material (only if no consumption exists)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Admin:Materials', 'Deleting material', { userId: user.id, materialId: id });
    const result = await deleteMaterial(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials', error);
    return createErrorResponse('Eroare la ștergerea materialului', 500);
  }
}
