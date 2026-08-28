/**
 * Materials module — smoke tests
 * Tests server-side logic (listMaterials, getMaterial) without HTTP layer.
 * Run: npx vitest run --testNamePattern="materials smoke"
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Prisma client ──────────────────────────────────────────────────────
// vi.mock is hoisted — data must be defined via vi.hoisted() to be available.
const { mockMaterials } = vi.hoisted(() => {
  const mockMaterials = [
  {
    id: 'seed-mat-001',
    name: 'Banner mesh 440g',
    sku: 'BANNER-MESH-440',
    categoryId: 'default_sheet',
    unit: 'm2',
    consumptionType: 'AREA_BASED',
    purchasePrice: '35',
    salePrice: '45',
    salePriceMode: 'amount',
    salePricePercent: null,
    wastePercent: 8,
    stock: 200,
    minStock: 20,
    active: true,
    notes: 'Mesh poliester 440g/m²',
    thickness: null,
    density: null,
    finishType: null,
    packagingLabel: null,
    packagingQty: null,
    packagingPrice: null,
    properties: null,
    createdAt: new Date('2026-08-28T00:00:00Z'),
    updatedAt: new Date('2026-08-28T00:00:00Z'),
    category: { id: 'default_sheet', name: 'Sheet Materials', requiresThickness: true, requiresDensity: false, requiresPricePerSqm: true, requiresPricePerMeter: false, requiresPricePerUnit: false, requiresWastePercent: true, active: true, description: null, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    compatibleMethods: [],
    print_methods: [],
    consumption: [],
  },
  {
    id: 'seed-mat-003',
    name: 'Vinil adeziv gri',
    sku: 'VINYL-ADH-GRI',
    categoryId: 'default_roll',
    unit: 'meter',
    consumptionType: 'AREA_BASED',
    purchasePrice: '9',
    salePrice: '12',
    salePriceMode: 'amount',
    salePricePercent: null,
    wastePercent: 5,
    stock: 500,
    minStock: 50,
    active: true,
    notes: 'Vinil adeziv cu spate gri',
    thickness: null,
    density: null,
    finishType: null,
    packagingLabel: null,
    packagingQty: null,
    packagingPrice: null,
    properties: null,
    createdAt: new Date('2026-08-28T00:00:00Z'),
    updatedAt: new Date('2026-08-28T00:00:00Z'),
    category: { id: 'default_roll', name: 'Roll Materials', requiresThickness: false, requiresDensity: false, requiresPricePerSqm: false, requiresPricePerMeter: false, requiresPricePerUnit: false, requiresWastePercent: true, active: true, description: null, parentId: null, createdAt: new Date(), updatedAt: new Date() },
    compatibleMethods: [],
    print_methods: [],
    consumption: [],
  },
];
  return { mockMaterials };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    material: {
      findMany: vi.fn().mockResolvedValue(mockMaterials),
      findUnique: vi.fn().mockImplementation(({ where }: { where: { id?: string; sku?: string } }) =>
        Promise.resolve(mockMaterials.find((m) => m.id === where.id || m.sku === where.sku) ?? null)
      ),
    },
  },
}));

import { listMaterials, getMaterialById } from '@/modules/materials/server';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('materials smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMaterials()', () => {
    it('returns an array', async () => {
      const result = await listMaterials();
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns at least 2 materials', async () => {
      const result = await listMaterials();
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('each material has required fields', async () => {
      const result = await listMaterials();
      for (const m of result) {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('sku');
        expect(m).toHaveProperty('unit');
        expect(m).toHaveProperty('active');
        expect(m).toHaveProperty('categoryId');
      }
    });

    it('lowStock flag is set when stock <= minStock', async () => {
      const result = await listMaterials();
      for (const m of result) {
        if (m.stock !== undefined && m.minStock !== undefined) {
          expect(m.lowStock).toBe(m.stock <= m.minStock);
        }
      }
    });

    it('purchasePrice is a number or null, never negative', async () => {
      const result = await listMaterials();
      for (const m of result) {
        if (m.purchasePrice !== null && m.purchasePrice !== undefined) {
          expect(Number(m.purchasePrice)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('salePrice >= purchasePrice when both present', async () => {
      const result = await listMaterials();
      for (const m of result) {
        if (m.purchasePrice !== null && m.salePrice !== null &&
            m.purchasePrice !== undefined && m.salePrice !== undefined) {
          expect(Number(m.salePrice)).toBeGreaterThanOrEqual(Number(m.purchasePrice));
        }
      }
    });
  });

  describe('getMaterialById(id)', () => {
    it('returns material by id', async () => {
      const result = await getMaterialById('seed-mat-001');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('seed-mat-001');
    });

    it('returns null for unknown id', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.material.findUnique).mockResolvedValueOnce(null);
      const result = await getMaterialById('non-existent-id');
      expect(result).toBeNull();
    });

    it('returned material has consumption array', async () => {
      const result = await getMaterialById('seed-mat-001');
      expect(result).toHaveProperty('consumption');
      expect(Array.isArray(result?.consumption)).toBe(true);
    });
  });
});
