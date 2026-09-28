import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { normalizeSupplierInput } from '@/modules/purchasing/suppliersValidation';

export async function GET() {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ ok: true, items: suppliers });
  } catch (error) {
    logger.error('API:Suppliers', 'Failed to fetch suppliers', { error });
    logApiError('API:Suppliers', error);
    return createErrorResponse('Eroare la încărcarea furnizorilor', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    if (body && typeof body === 'object' && ('apiEndpoint' in body || 'apiKey' in body || 'defaultCurrency' in body || 'testConnection' in body)) {
      logger.warn('API:Suppliers', 'Legacy supplier fields ignored', {
        hasApiEndpoint: 'apiEndpoint' in body,
        hasApiKey: 'apiKey' in body,
        hasDefaultCurrency: 'defaultCurrency' in body,
        hasTestConnection: 'testConnection' in body,
      });
    }
    const source = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    const normalized = normalizeSupplierInput({
      name: source.name,
      address: source.address,
      phones: source.phones,
      website: source.website,
      codFiscal: source.codFiscal,
      notes: source.notes,
    });

    const supplier = await prisma.supplier.create({
      data: {
        name: normalized.name,
        phones: normalized.phones.map((phone) => phone.number),
        address: normalized.address,
        website: normalized.website,
        codFiscal: normalized.codFiscal,
        notes: normalized.notes,
      },
    });

    return NextResponse.json({ ok: true, item: supplier }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400);
    }
    logApiError('API:Suppliers', error);
    return createErrorResponse('Eroare la crearea furnizorului', 500);
  }
}
