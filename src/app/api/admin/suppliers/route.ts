import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { normalizeSupplierInput } from '@/modules/purchasing/suppliersValidation';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';

    const suppliers = await prisma.supplier.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
      take: 20,
    });

    return NextResponse.json({ ok: true, items: suppliers, suppliers });
  } catch (error) {
    logger.error('API:Admin:Suppliers', 'Failed to fetch suppliers', { error });
    logApiError('API:Admin:Suppliers', error);
    return createErrorResponse('Eroare la încărcarea furnizorilor', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    if (body && typeof body === 'object' && ('apiEndpoint' in body || 'apiKey' in body || 'defaultCurrency' in body || 'testConnection' in body)) {
      logger.warn('API:Admin:Suppliers', 'Legacy supplier fields ignored', {
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
    logApiError('API:Admin:Suppliers', error);
    return createErrorResponse('Eroare la crearea furnizorului', 500);
  }
}
