import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as createPost } from '@/app/api/admin/materials/route';
import { MaterialApiValidationError } from '@/modules/materials/server';
import { requireRole } from '@/lib/auth-helpers';

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
    createMaterial: vi.fn(async (payload) => ({
      id: 'mat-1',
      ...payload,
      name: payload.name ?? 'Custom name',
      formatId: payload.formatId ?? null,
      width_mm: payload.width_mm ?? null,
      height_mm: payload.height_mm ?? null,
    })),
    listMaterials: vi.fn(async () => []),
    getCompatibleMaterials: vi.fn(async () => []),
  };
});

describe('POST /api/admin/materials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUniqueFormatMock.mockClear();
  });

  it('saves formatId and respects client overrides for dimensions', async () => {
    const request = new NextRequest('http://localhost/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Custom name',
        materialType: 'SUPORT_FOI',
        formatId: 'format-uuid-123',
        width_mm: 220,
        height_mm: 300,
        unit: 'm2',
      }),
    });

    const response = await createPost(request);
    const body = await response.json();

    expect(requireRole).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      id: 'mat-1',
      name: 'Custom name',
      formatId: 'format-uuid-123',
      width_mm: 220,
      height_mm: 300,
    });
  });

  it('returns 400 when the selected format does not exist', async () => {
    const { createMaterial } = await import('@/modules/materials/server');
    vi.mocked(createMaterial).mockRejectedValueOnce(
      new MaterialApiValidationError('Formatul selectat nu există', 400)
    );

    const request = new NextRequest('http://localhost/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Broken format',
        materialType: 'SUPORT_FOI',
        formatId: 'nope',
        width_mm: 210,
        height_mm: 297,
      }),
    });

    const response = await createPost(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: '_general',
          message: 'Formatul selectat nu există',
        }),
      ])
    );
  });

  it('normalizes COALA payload to SUPORT_FOI, maps legacy fields and overrides dimensions from format', async () => {
    const { createMaterial } = await import('@/modules/materials/server');

    const request = new NextRequest('http://localhost/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Hartie offset',
        materialType: 'COALA',
        unit: 'sheet',
        formatId: 'format-uuid-123',
        width_mm: 999,
        height_mm: 999,
        gramaj_g: 170,
        sheets_per_box: 250,
      }),
    });

    const response = await createPost(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(findUniqueFormatMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'format-uuid-123' } })
    );

    expect(vi.mocked(createMaterial)).toHaveBeenCalledWith(
      expect.objectContaining({
        materialType: 'SUPORT_FOI',
        unit: 'sheet',
        formatId: 'format-uuid-123',
        width_mm: 210,
        height_mm: 297,
        density: 170,
        packagingQty: 250,
      })
    );

    expect(body).toMatchObject({
      materialType: 'SUPORT_FOI',
      width_mm: 210,
      height_mm: 297,
      density: 170,
      packagingQty: 250,
    });
  });

  it('ignores irrelevant dimension fields for kg unit payloads', async () => {
    const { createMaterial } = await import('@/modules/materials/server');

    const request = new NextRequest('http://localhost/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ink black',
        materialType: 'CERNEALA',
        unit: 'kg',
        width_mm: 999,
        height_mm: 999,
        thickness: 2,
        density: 1.05,
        consumptionRate: 3.5,
      }),
    });

    const response = await createPost(request);
    expect(response.status).toBe(201);

    const payload = vi.mocked(createMaterial).mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      unit: 'kg',
      density: 1.05,
      consumptionRate: 3.5,
    });
    expect(payload).not.toHaveProperty('width_mm');
    expect(payload).not.toHaveProperty('height_mm');
    expect(payload).not.toHaveProperty('thickness');
  });

});
