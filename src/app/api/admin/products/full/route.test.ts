import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { POST as createFullProduct } from '@/app/api/admin/products/full/route';
import { PATCH as updateFullProduct } from '@/app/api/admin/products/[id]/full/route';
import type { CreateFullProductInput } from '@/modules/products/productBuilder.types';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/modules/auth/nextauth', () => ({
  authOptions: {},
}));

const prismaMock = vi.hoisted(() => ({
  product: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  category: {
    findUnique: vi.fn(),
  },
  productImage: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  productMaterial: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  productPrintMethod: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  productFinishing: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

const getServerSessionMock = vi.mocked(getServerSession);
const adminSession = { user: { role: 'ADMIN' } } as const;

const prismaFunctionMocks = [
  prismaMock.product.findUnique,
  prismaMock.product.create,
  prismaMock.product.update,
  prismaMock.category.findUnique,
  prismaMock.productImage.createMany,
  prismaMock.productImage.deleteMany,
  prismaMock.productMaterial.createMany,
  prismaMock.productMaterial.deleteMany,
  prismaMock.productPrintMethod.createMany,
  prismaMock.productPrintMethod.deleteMany,
  prismaMock.productFinishing.createMany,
  prismaMock.productFinishing.deleteMany,
  prismaMock.$transaction,
] as const;

function mockJsonRequest<T>(payload: T): NextRequest {
  return {
    json: async () => payload,
  } as unknown as NextRequest;
}

function buildPersistedProduct(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: 'prod-1',
    name: 'Produs test',
    slug: 'test-product',
    sku: 'SKU-123',
    description: 'descriere',
    descriptionShort: 'scurt',
    type: 'STANDARD',
    price: 120,
    categoryId: 'cat-1',
    active: true,
    createdAt: now,
    updatedAt: now,
    metaTitle: 'Meta',
    metaDescription: 'Desc',
    ogImage: 'https://cdn/meta.png',
    options: [],
    pricing: { type: 'fixed', basePrice: 120, priceBreaks: [] },
    production: {
      operations: [{ name: 'Taiere', order: 1, timeMinutes: 30 }],
      estimatedTime: 30,
    },
    dimensions: { widthMin: 10, widthMax: 50, heightMin: 5, heightMax: 40, unit: 'cm' },
    category: { id: 'cat-1', name: 'Categoria', slug: 'categoria' },
    images: [{ id: 'img-1', productId: 'prod-1', url: 'https://cdn/image.png' }],
    materials: [{ id: 'mat-rel-1', productId: 'prod-1', materialId: 'mat-1' }],
    printMethods: [{ id: 'print-rel-1', productId: 'prod-1', printMethodId: 'print-1' }],
    finishing: [{ id: 'fin-rel-1', productId: 'prod-1', finishingId: 'fin-1' }],
    ...overrides,
  };
}

beforeEach(() => {
  prismaFunctionMocks.forEach((mockFn) => mockFn.mockReset());
  getServerSessionMock.mockReset();
  prismaMock.$transaction.mockImplementation(async (operations: Promise<unknown>[]) => {
    await Promise.all(operations);
  });
});

describe('Full product API flow', () => {
  it('rejects unauthorized create attempts', async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const response = await createFullProduct(mockJsonRequest({} as CreateFullProductInput));

    expect(response.status).toBe(401);
  });

  it('creates a product with all related entities', async () => {
    getServerSessionMock.mockResolvedValue(adminSession as any);

    const payload: CreateFullProductInput = {
      name: ' Produs configurabil ',
      slug: 'produs-configurabil',
      sku: 'SKU-999',
      description: 'Descriere completa',
      descriptionShort: 'scurta',
      type: 'CONFIGURABLE',
      categoryId: 'cat-1',
      active: true,
      options: [
        {
          name: 'Culoare',
          type: 'dropdown',
          required: true,
          values: [
            { label: 'Alb', value: 'alb' },
            { label: 'Negru', value: 'negru', priceModifier: 5 },
          ],
        },
      ],
      dimensions: { widthMin: 10, widthMax: 200, heightMin: 10, heightMax: 200, unit: 'cm' },
      compatibleMaterials: ['mat-1'],
      compatiblePrintMethods: ['print-1'],
      compatibleFinishing: ['fin-1'],
      pricing: {
        type: 'per_unit',
        basePrice: 35,
        priceBreaks: [{ minQuantity: 10, maxQuantity: 50, pricePerUnit: 30 }],
      },
      production: {
        operations: [{ name: 'Taiere', order: 1, timeMinutes: 20 }],
        estimatedTime: 45,
      },
      seo: {
        metaTitle: 'Meta title',
        metaDescription: 'Meta description',
        ogImage: 'https://cdn/meta.png',
      },
      images: [' https://cdn/first.png ', 'https://cdn/second.png'],
    };

    prismaMock.product.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        buildPersistedProduct({
          id: 'prod-1',
          slug: payload.slug,
          name: payload.name.trim(),
          type: payload.type,
          price: payload.pricing.basePrice,
          options: payload.options,
          pricing: payload.pricing,
          production: payload.production,
          dimensions: payload.dimensions,
        })
      );

    prismaMock.category.findUnique.mockResolvedValueOnce({ id: payload.categoryId });
    prismaMock.product.create.mockResolvedValueOnce({ id: 'prod-1' });

    const response = await createFullProduct(mockJsonRequest(payload));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      id: 'prod-1',
      slug: payload.slug,
      compatibleMaterials: ['mat-1'],
      compatiblePrintMethods: ['print-1'],
      compatibleFinishing: ['fin-1'],
      pricing: payload.pricing,
    });

    expect(prismaMock.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: payload.name.trim(),
          slug: payload.slug,
          price: payload.pricing.basePrice,
          pricing: payload.pricing,
        }),
      })
    );

    expect(prismaMock.productImage.createMany).toHaveBeenCalledWith({
      data: [
        { productId: 'prod-1', url: 'https://cdn/first.png' },
        { productId: 'prod-1', url: 'https://cdn/second.png' },
      ],
    });
  });

  it('updates a product and refreshes relations', async () => {
    getServerSessionMock.mockResolvedValue(adminSession as any);

    const payload: Partial<CreateFullProductInput> = {
      name: 'Produs actualizat',
      slug: 'produs-actualizat',
      categoryId: 'cat-2',
      pricing: { type: 'fixed', basePrice: 99, priceBreaks: [] },
      compatibleMaterials: ['mat-2', 'mat-3'],
      compatiblePrintMethods: [],
      compatibleFinishing: ['fin-2'],
      images: ['https://cdn/new-main.png', '   '],
    };

    prismaMock.product.findUnique
      .mockResolvedValueOnce({ id: 'prod-1', slug: 'current-slug' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        buildPersistedProduct({
          slug: payload.slug,
          price: payload.pricing?.basePrice,
          pricing: payload.pricing,
          materials: payload.compatibleMaterials?.map((materialId, index) => ({
            id: `mat-${index}`,
            productId: 'prod-1',
            materialId,
          })),
          printMethods: [],
          finishing: payload.compatibleFinishing?.map((finishingId, index) => ({
            id: `fin-${index}`,
            productId: 'prod-1',
            finishingId,
          })),
          images: [{ id: 'img-2', productId: 'prod-1', url: 'https://cdn/new-main.png' }],
        })
      );

    prismaMock.category.findUnique.mockResolvedValueOnce({ id: 'cat-2' });
    prismaMock.product.update.mockResolvedValueOnce({ id: 'prod-1' });

    const response = await updateFullProduct(
      mockJsonRequest(payload),
      { params: Promise.resolve({ id: 'prod-1' }) }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      id: 'prod-1',
      slug: payload.slug,
      compatibleMaterials: payload.compatibleMaterials,
      compatibleFinishing: payload.compatibleFinishing,
      images: [{ id: 'img-2', productId: 'prod-1', url: 'https://cdn/new-main.png' }],
    });

    expect(prismaMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: payload.slug,
          pricing: payload.pricing,
          price: payload.pricing?.basePrice,
        }),
      })
    );

    expect(prismaMock.productImage.deleteMany).toHaveBeenCalledWith({ where: { productId: 'prod-1' } });
    expect(prismaMock.productImage.createMany).toHaveBeenCalledWith({
      data: [{ productId: 'prod-1', url: 'https://cdn/new-main.png' }],
    });
  });
});
