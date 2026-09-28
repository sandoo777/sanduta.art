import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { normalizeSupplierPatchInput } from '@/modules/purchasing/suppliersValidation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      return createErrorResponse('Furnizorul nu a fost găsit', 404);
    }

    return NextResponse.json({ ok: true, item: supplier });
  } catch (error) {
    logger.error('API:Admin:SupplierDetail', 'Failed to fetch supplier detail', { error });
    logApiError('API:Admin:SupplierDetail', error);
    return createErrorResponse('Eroare la încărcarea furnizorului', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    if (body && typeof body === 'object' && ('apiEndpoint' in body || 'apiKey' in body || 'defaultCurrency' in body || 'testConnection' in body)) {
      logger.warn('API:Admin:SupplierDetail', 'Legacy supplier fields ignored on update', {
        supplierId: id,
        hasApiEndpoint: 'apiEndpoint' in body,
        hasApiKey: 'apiKey' in body,
        hasDefaultCurrency: 'defaultCurrency' in body,
        hasTestConnection: 'testConnection' in body,
      });
    }
    const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    const normalized = normalizeSupplierPatchInput({
      name: source.name,
      address: source.address,
      phones: source.phones,
      website: source.website,
      codFiscal: source.codFiscal,
      notes: source.notes,
    });

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(normalized.name !== undefined ? { name: normalized.name } : {}),
        ...(normalized.phones !== undefined ? { phones: normalized.phones.map((phone) => phone.number) } : {}),
        ...(normalized.address !== undefined ? { address: normalized.address } : {}),
        ...(normalized.website !== undefined ? { website: normalized.website } : {}),
        ...(normalized.codFiscal !== undefined ? { codFiscal: normalized.codFiscal } : {}),
        ...(normalized.notes !== undefined ? { notes: normalized.notes } : {}),
      },
    });

    return NextResponse.json({ ok: true, item: supplier });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400);
    }
    logApiError('API:Admin:SupplierDetail', error);
    return createErrorResponse('Eroare la actualizarea furnizorului', 500);
  }
}
