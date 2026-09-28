import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFormatRows = [
  {
    id: 'fmt-1',
    category: 'FOI',
    name: '210x297 mm',
    width_mm: 210,
    height_mm: 297,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
];

const settingsStore: Record<string, string> = {
  format_categories: JSON.stringify([
    { id: 'cat-foi', code: 'FOI', name: 'Foi', enabled: true, usageCount: 0 },
    { id: 'cat-role', code: 'ROLE', name: 'Role', enabled: true, usageCount: 0 },
  ]),
};

function resetSettingsStore() {
  settingsStore.format_categories = JSON.stringify([
    { id: 'cat-foi', code: 'FOI', name: 'Foi', enabled: true, usageCount: 0 },
    { id: 'cat-role', code: 'ROLE', name: 'Role', enabled: true, usageCount: 0 },
  ]);
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    format: {
      findMany: vi.fn(async () => mockFormatRows),
      findUnique: vi.fn(async ({ where }) => mockFormatRows.find((row) => row.id === where.id) ?? null),
      create: vi.fn(async ({ data }) => ({
        id: 'fmt-new',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      update: vi.fn(async ({ where, data }) => ({
        id: where.id,
        ...mockFormatRows[0],
        ...data,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date(),
      })),
      updateMany: vi.fn(async () => ({ count: 0 })),
      delete: vi.fn(async ({ where }) => ({ id: where.id })),
      count: vi.fn(async ({ where }) => mockFormatRows.filter((row) => row.category === where.category).length),
    },
    systemSetting: {
      findUnique: vi.fn(async ({ where }) => {
        const key = where?.key;
        if (!key || !(key in settingsStore)) return null;
        return { key, value: settingsStore[key] };
      }),
      create: vi.fn(async ({ data }) => {
        settingsStore[data.key] = data.value;
        return { id: data.key, ...data };
      }),
      update: vi.fn(async ({ where, data }) => {
        settingsStore[where.key] = data.value;
        return { key: where.key, value: data.value };
      }),
      upsert: vi.fn(async ({ where, update, create }) => {
        settingsStore[where.key] = update?.value ?? create.value;
        return { key: where.key, value: settingsStore[where.key] };
      }),
    },
    material: {
      updateMany: vi.fn(async () => ({ count: 0 })),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireRole: vi.fn(async () => ({ user: { id: 'admin-1', role: 'ADMIN' }, error: null })),
}));

import { GET, POST } from '@/app/api/admin/formats/route';
import { GET as GET_CATEGORIES, POST as POST_CATEGORY } from '@/app/api/admin/formats_categories/route';

describe('formats API smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSettingsStore();
  });

  it('GET /api/admin/formats returns 200 array', async () => {
    const res = await GET(new Request('http://localhost/api/admin/formats'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toHaveProperty('name');
    expect(body[0]).toHaveProperty('category');
  });

  it('POST /api/admin/formats creates FOI with required dimensions', async () => {
    const res = await POST(
      new Request('http://localhost/api/admin/formats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'FOI',
          width_mm: 297,
          height_mm: 420,
          name: '297x420 mm',
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.category).toBe('FOI');
    expect(body.name).toBe('297x420 mm');
    expect(body.width_mm).toBe(297);
    expect(body.height_mm).toBe(420);
  });

  it('POST /api/admin/formats creates ROLE with width only', async () => {
    const res = await POST(
      new Request('http://localhost/api/admin/formats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ROLE',
          width_mm: 1370,
          name: '1370 mm',
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.category).toBe('ROLE');
    expect(body.name).toBe('1370 mm');
    expect(body.width_mm).toBe(1370);
    expect(body.height_mm).toBeNull();
  });

  it('GET /api/admin/formats_categories returns dynamic categories', async () => {
    const res = await GET_CATEGORIES(new Request('http://localhost/api/admin/formats_categories'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.map((item: { code: string }) => item.code)).toEqual(expect.arrayContaining(['FOI', 'ROLE']));
  });

  it('GET /api/admin/formats_categories restores FOI/ROLE when setting is incomplete', async () => {
    settingsStore.format_categories = JSON.stringify([
      { id: 'cat-textile', code: 'TEXTILE', name: 'Textile', enabled: true, usageCount: 0 },
    ]);

    const res = await GET_CATEGORIES(new Request('http://localhost/api/admin/formats_categories'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.map((item: { code: string }) => item.code)).toEqual(
      expect.arrayContaining(['FOI', 'ROLE', 'TEXTILE'])
    );
  });

  it('POST /api/admin/formats_categories can create TEXTILE category', async () => {
    const res = await POST_CATEGORY(
      new Request('http://localhost/api/admin/formats_categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TEXTILE', name: 'Textile' }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.item.code).toBe('TEXTILE');
  });

  it('POST /api/admin/formats accepts custom TEXTILE category for S/M/L/XL', async () => {
    const categoryRes = await POST_CATEGORY(
      new Request('http://localhost/api/admin/formats_categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TEXTILE', name: 'Textile' }),
      })
    );
    expect(categoryRes.status).toBe(201);

    for (const size of ['S', 'M', 'L', 'XL']) {
      const res = await POST(
        new Request('http://localhost/api/admin/formats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'TEXTILE',
            width_mm: 10,
            height_mm: null,
            name: size,
          }),
        })
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.category).toBe('TEXTILE');
      expect(body.name).toBe(size);
    }
  });
});
