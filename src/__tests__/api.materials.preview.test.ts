import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as previewPost } from '@/app/api/admin/materials/preview/route';
import { requireRole } from '@/lib/auth-helpers';

vi.mock('@/lib/auth-helpers', () => ({
  requireRole: vi.fn(async () => ({
    user: { id: 'admin-1', role: 'ADMIN' },
    error: null,
  })),
}));

describe('POST /api/admin/materials/preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns area_m2, estimated_consumption and autoName for SUPORT_FOI', async () => {
    const request = new NextRequest('http://localhost/api/admin/materials/preview', {
      method: 'POST',
      body: JSON.stringify({
        materialType: 'SUPORT_FOI',
        width_mm: 210,
        height_mm: 297,
        unit: 'm2',
      }),
    });

    const response = await previewPost(request);
    const body = await response.json();

    expect(requireRole).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      preview: {
        area_m2: 0.06237,
        autoName: '210x297 mm',
      },
    });
    expect(body.preview.estimated_consumption).toMatchObject({
      unit: 'L',
      value: expect.any(Number),
    });
  });
});
