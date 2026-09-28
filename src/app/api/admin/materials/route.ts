import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { createErrorResponse, logApiError, logger } from "@/lib/logger";
import { createMaterial, getCompatibleMaterials, listMaterials, MaterialApiValidationError } from "@/modules/materials/server";
import { normalizeMaterialBody } from "./normalizeMaterialBody";

function toSupplierIdOnlyList(value: unknown): Array<{ supplierId: string }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        const supplierId = entry.trim();
        return supplierId ? { supplierId } : null;
      }

      if (!entry || typeof entry !== 'object') return null;
      const supplierId = typeof (entry as { supplierId?: unknown }).supplierId === 'string'
        ? (entry as { supplierId: string }).supplierId.trim()
        : '';

      return supplierId ? { supplierId } : null;
    })
    .filter((entry): entry is { supplierId: string } => Boolean(entry));
}

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
      return error.errors.length > 0
        ? NextResponse.json(error.errors, { status: error.status })
        : createErrorResponse(error.message, error.status);
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
    const normalizedBody = await normalizeMaterialBody(body) as Record<string, unknown>;
    normalizedBody.suppliers = toSupplierIdOnlyList(normalizedBody.suppliers);

    // TEMPORARY DEBUG: keep only for 48–72h in dev while investigating create/edit regressions.
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEBUG] normalized material body', JSON.stringify(normalizedBody));
    }

    logger.info('API:Admin:Materials', 'Creating material', { userId: user.id });
    const material = await createMaterial(normalizedBody);
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    if (error instanceof MaterialApiValidationError) {
      return error.errors.length > 0
        ? NextResponse.json(error.errors, { status: error.status })
        : createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Materials', error);
    const message = error instanceof Error && process.env.NODE_ENV !== 'production'
      ? error.message
      : 'Eroare la crearea materialului';
    return createErrorResponse(message, 500);
  }
}
