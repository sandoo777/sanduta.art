import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as searchProducts } from '@/app/api/products/search/route';
import { GET as getCategoryTree } from '@/app/api/categories/tree/route';
import { GET as trackOrder } from '@/app/api/orders/track/route';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn()
    },
    category: {
      findMany: vi.fn()
    },
    order: {
      findFirst: vi.fn()
    }
  }
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  },
  logApiError: vi.fn(),
  createErrorResponse: vi.fn((msg, status) => 
    new Response(JSON.stringify({ error: msg }), { status })
  )
}));

describe('Product Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search products by query', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Canvas Print',
        price: 99.99,
        stock: 10,
        category: { id: 'cat1', name: 'Canvas', slug: 'canvas' }
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);
    vi.mocked(prisma.product.count).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/products/search?q=canvas');
    const response = await searchProducts(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe('Canvas Print');
    expect(data.pagination).toHaveProperty('totalCount', 1);
  });

  it('should filter by price range', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    const request = new NextRequest('http://localhost:3000/api/products/search?minPrice=50&maxPrice=100');
    const response = await searchProducts(request);

    expect(response.status).toBe(200);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              price: { gte: 50, lte: 100 }
            })
          ])
        })
      })
    );
  });

  it('should filter by stock availability', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    const request = new NextRequest('http://localhost:3000/api/products/search?inStock=true');
    await searchProducts(request);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              stock: { gt: 0 }
            })
          ])
        })
      })
    );
  });

  it('should paginate results', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(50);

    const request = new NextRequest('http://localhost:3000/api/products/search?page=2&limit=10');
    const response = await searchProducts(request);
    const data = await response.json();

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10
      })
    );
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.totalPages).toBe(5);
    expect(data.pagination.hasNextPage).toBe(true);
    expect(data.pagination.hasPreviousPage).toBe(true);
  });
});

describe('Category Tree API', () => {
  it('should return category tree with product counts', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Canvas',
        slug: 'canvas',
        description: 'Canvas prints',
        _count: { products: 15 }
      },
      {
        id: '2',
        name: 'Posters',
        slug: 'posters',
        description: 'Poster prints',
        _count: { products: 10 }
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

    const response = await getCategoryTree();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.categories).toHaveLength(2);
    expect(data.categories[0].productCount).toBe(15);
    expect(data.totalCount).toBe(2);
  });
});

describe('Order Tracking API', () => {
  it('should track order with valid credentials', async () => {
    const mockOrder = {
      id: 'order123',
      status: 'IN_PRODUCTION',
      total: 199.99,
      createdAt: new Date('2026-01-01'),
      confirmedAt: new Date('2026-01-02'),
      productionStartedAt: new Date('2026-01-03'),
      shippedAt: null,
      deliveredAt: null,
      customerEmail: 'test@example.com',
      items: [],
      payment: { status: 'PAID' },
      delivery: { status: 'PENDING' }
    };

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findFirst).mockResolvedValue(mockOrder);

    const request = new NextRequest('http://localhost:3000/api/orders/track?orderId=order123&email=test@example.com');
    const response = await trackOrder(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.id).toBe('order123');
    expect(data.timeline).toHaveLength(5);
    expect(data.timeline[0].completed).toBe(true);
    expect(data.timeline[2].completed).toBe(true);
    expect(data.timeline[4].completed).toBe(false);
  });

  it('should return 404 for non-existent order', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders/track?orderId=fake&email=test@example.com');
    const response = await trackOrder(request);

    expect(response.status).toBe(404);
  });

  it('should return 400 without required parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders/track');
    const response = await trackOrder(request);

    expect(response.status).toBe(400);
  });
});
