import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUniqueMock, updateMock, materialCategoryFindUniqueMock, materialCategoryFindFirstMock, supplierFindManyMock, printMethodFindManyMock, formatFindUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(async ({ where }: { where: { id?: string; sku?: string } }) => {
    if (where.id === 'mat-1') {
      return {
        id: 'mat-1',
        name: 'Existing material',
        sku: 'MAT-001',
        categoryId: 'cat-1',
        thickness: null,
        density: null,
        purchasePrice: null,
        salePrice: null,
        salePriceMode: 'amount',
        salePricePercent: null,
        wastePercent: 0,
        formatId: null,
        formatName: null,
        width_mm: null,
        height_mm: null,
        materialType: null,
        consumptionRate: null,
        isTemplate: false,
        primarySupplierId: null,
        active: true,
        unit: 'pcs',
        consumptionType: 'DIRECT',
        stock: 0,
        minStock: 0,
        notes: null,
        finishType: null,
        packagingLabel: null,
        packagingQty: null,
        packagingPrice: null,
        properties: { color: 'alb', whiteness: 92 },
        compatibleMethods: [],
        category: {
          id: 'cat-1',
          name: 'paper',
          description: null,
          requiresThickness: false,
          requiresDensity: false,
          requiresPricePerSqm: false,
          requiresPricePerMeter: false,
          requiresPricePerUnit: false,
          requiresWastePercent: false,
          active: true,
        },
        primarySupplier: null,
        materialSuppliers: [],
        consumption: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return null;
  }),
  updateMock: vi.fn(async () => ({
    id: 'mat-1',
    name: 'Existing material',
    sku: 'MAT-001',
    categoryId: 'cat-1',
    thickness: null,
    density: null,
    purchasePrice: null,
    salePrice: null,
    salePriceMode: 'amount',
    salePricePercent: null,
    wastePercent: 0,
    formatId: null,
    formatName: null,
    width_mm: null,
    height_mm: null,
    materialType: null,
    consumptionRate: null,
    isTemplate: false,
    primarySupplierId: null,
    active: true,
    unit: 'pcs',
    consumptionType: 'DIRECT',
    stock: 0,
    minStock: 0,
    notes: null,
    finishType: null,
    packagingLabel: null,
    packagingQty: null,
    packagingPrice: null,
    properties: { color: 'galben' },
    compatibleMethods: [],
    category: {
      id: 'cat-1',
      name: 'paper',
      description: null,
      requiresThickness: false,
      requiresDensity: false,
      requiresPricePerSqm: false,
      requiresPricePerMeter: false,
      requiresPricePerUnit: false,
      requiresWastePercent: false,
      active: true,
    },
    primarySupplier: null,
    materialSuppliers: [],
    consumption: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  materialCategoryFindUniqueMock: vi.fn(async () => ({
    id: 'cat-1',
    requiresPricePerSqm: false,
    requiresPricePerMeter: false,
    requiresPricePerUnit: false,
  })),
  materialCategoryFindFirstMock: vi.fn(async () => ({ id: 'cat-1' })),
  supplierFindManyMock: vi.fn(async () => []),
  printMethodFindManyMock: vi.fn(async () => []),
  formatFindUniqueMock: vi.fn(async () => null),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    material: {
      findUnique: findUniqueMock,
      findMany: vi.fn(async () => []),
      update: updateMock,
    },
    materialCategory: {
      findUnique: materialCategoryFindUniqueMock,
      findFirst: materialCategoryFindFirstMock,
    },
    supplier: {
      findMany: supplierFindManyMock,
    },
    printMethod: {
      findMany: printMethodFindManyMock,
    },
    format: {
      findUnique: formatFindUniqueMock,
    },
  },
}));

import { updateMaterial } from '@/modules/materials/server';

describe('materials server - properties update semantics', () => {
  beforeEach(() => {
    updateMock.mockClear();
    findUniqueMock.mockClear();
  });

  it('replaces properties instead of merging old values', async () => {
    const result = await updateMaterial('mat-1', {
      properties: {
        color: 'galben',
      },
    });

    const updateArgs = updateMock.mock.calls[0]?.[0] as { data?: { properties?: Record<string, unknown> } } | undefined;
    expect(updateArgs?.data?.properties).toEqual({ color: 'galben' });
    expect(updateArgs?.data?.properties).not.toHaveProperty('whiteness');
    expect(result.properties).toEqual({ color: 'galben' });
  });
});
