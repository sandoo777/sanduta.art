import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { createErrorResponse, logApiError, logger } from "@/lib/logger";
import { createMaterial, getCompatibleMaterials, listMaterials, MaterialApiValidationError } from "@/modules/materials/server";

/**
 * GET /api/admin/materials
 * List all materials with low stock indicators and total consumption
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const printMethodId = searchParams.get('printMethodId') ?? undefined;
    const equipmentId = searchParams.get('equipmentId') ?? undefined;

    logger.info('API:Admin:Materials', 'Fetching materials', { userId: user.id });
    const materials = printMethodId || equipmentId
      ? await getCompatibleMaterials({ printMethodId, equipmentId })
      : await listMaterials();
    return NextResponse.json(materials);
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials', error);
    return createErrorResponse('Eroare la preluarea materialelor', 500);
  }
}

/**
 * POST /api/admin/materials
 * Create a new material
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    logger.info('API:Admin:Materials', 'Creating material', { userId: user.id });
    const material = await createMaterial(body);
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials', error);
    return createErrorResponse('Eroare la crearea materialului', 500);
  }
}
