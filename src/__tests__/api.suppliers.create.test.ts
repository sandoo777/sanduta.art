import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as createSupplierPost } from '@/app/api/admin/suppliers/route';

const { supplierCreateMock } = vi.hoisted(() => ({
  supplierCreateMock: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 'sup-1',
    ...data,
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    supplier: {
      create: supplierCreateMock,
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireRole: vi.fn(async () => ({
    user: { id: 'admin-1', role: 'ADMIN' },
    error: null,
  })),
}));

describe('POST /api/admin/suppliers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves normalized codFiscal and allowed fields', async () => {
    const request = new NextRequest('http://localhost/api/admin/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Acme Supply',
        phones: ['060111222'],
        codFiscal: '1234-5678',
      }),
    });

    const response = await createSupplierPost(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(supplierCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Acme Supply',
          codFiscal: '12345678',
          phones: ['+37360111222'],
        }),
      })
    );
    expect(body).toMatchObject({ ok: true, item: expect.objectContaining({ id: 'sup-1' }) });
  });

  it('ignores apiEndpoint/apiKey/defaultCurrency from payload', async () => {
    const request = new NextRequest('http://localhost/api/admin/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Legacy Supplier',
        phones: ['+37360111222'],
        codFiscal: '123456789',
        apiEndpoint: 'https://legacy.example',
        apiKey: 'secret',
        defaultCurrency: 'EUR',
      }),
    });

    const response = await createSupplierPost(request);
    expect(response.status).toBe(201);

    const createData = supplierCreateMock.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(createData).not.toHaveProperty('apiEndpoint');
    expect(createData).not.toHaveProperty('apiKey');
    expect(createData).not.toHaveProperty('defaultCurrency');
    expect(createData).not.toHaveProperty('email');
    expect(createData).not.toHaveProperty('preferredChannel');
    expect(createData).not.toHaveProperty('defaultLeadTimeDays');
  });

  it('returns 400 when codFiscal is invalid', async () => {
    const request = new NextRequest('http://localhost/api/admin/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Broken Supplier',
        phones: ['+37360111222'],
        codFiscal: 'ABCD',
      }),
    });

    const response = await createSupplierPost(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(String(body.error ?? body.message ?? '')).toMatch(/Cod fiscal invalid/i);
  });
});
