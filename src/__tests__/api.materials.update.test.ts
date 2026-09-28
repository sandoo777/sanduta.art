import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { PUT as updatePut } from '@/app/api/admin/materials/[id]/route';

const { findUniqueFormatMock } = vi.hoisted(() => ({
  findUniqueFormatMock: vi.fn(async ({ where }: { where: { id: string } }) => {
    if (where.id === 'format-uuid-123') {
      return { id: 'format-uuid-123', width_mm: 210, height_mm: 297, name: 'A4' };
    }

    return null;
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    format: {
      findUnique: findUniqueFormatMock,
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireRole: vi.fn(async () => ({
    user: { id: 'admin-1', role: 'ADMIN' },
    error: null,
  })),
}));

vi.mock('@/modules/materials/server', async () => {
  const actual = await vi.importActual<typeof import('@/modules/materials/server')>('@/modules/materials/server');

  return {
    ...actual,
    updateMaterial: vi.fn(async (_id: string, payload) => ({
      id: 'mat-1',
      ...payload,
    })),
    getMaterialById: vi.fn(async () => null),
    deleteMaterial: vi.fn(async () => ({ deleted: true })),
  };
});

describe('PUT /api/admin/materials/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUniqueFormatMock.mockClear();
  });

  it('normalizes COALA payload and overrides dimensions from selected format', async () => {
    const { updateMaterial } = await import('@/modules/materials/server');

    const request = new NextRequest('http://localhost/api/admin/materials/mat-1', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Updated sheet',
        materialType: 'COALA',
        unit: 'sheet',
        formatId: 'format-uuid-123',
        width_mm: 999,
        height_mm: 999,
        gramaj_g: 150,
        foi_per_cutie: 300,
      }),
    });

    const response = await updatePut(request, { params: Promise.resolve({ id: 'mat-1' }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(findUniqueFormatMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'format-uuid-123' } })
    );

    expect(vi.mocked(updateMaterial)).toHaveBeenCalledWith(
      'mat-1',
      expect.objectContaining({
        materialType: 'SUPORT_FOI',
        width_mm: 210,
        height_mm: 297,
        density: 150,
        packagingQty: 300,
      })
    );

    expect(body).toMatchObject({
      materialType: 'SUPORT_FOI',
      width_mm: 210,
      height_mm: 297,
      density: 150,
      packagingQty: 300,
    });
  });
});
