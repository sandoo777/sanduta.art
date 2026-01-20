import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getWishlist, POST as addToWishlist, DELETE as removeFromWishlist } from '@/app/api/customer/wishlist/route';
import { POST as exportReport } from '@/app/api/admin/reports/export/route';

// Mock auth
vi.mock('@/lib/auth-helpers', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'user1', role: 'VIEWER', email: 'user@test.com' },
    error: null
  }),
  requireRole: vi.fn().mockResolvedValue({
    user: { id: 'admin1', role: 'ADMIN', email: 'admin@test.com' },
    error: null
  })
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    wishlistItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn()
    },
    order: {
      findMany: vi.fn()
    },
    product: {
      findMany: vi.fn()
    },
    user: {
      findMany: vi.fn()
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

describe('Wishlist API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get user wishlist', async () => {
    const mockWishlist = [
      {
        id: '1',
        userId: 'user1',
        productId: 'prod1',
        createdAt: new Date(),
        product: {
          id: 'prod1',
          name: 'Canvas Print',
          price: 99.99,
          category: { id: 'cat1', name: 'Canvas' }
        }
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.wishlistItem.findMany).mockResolvedValue(mockWishlist as any);

    const request = new NextRequest('http://localhost:3000/api/customer/wishlist');
    const response = await getWishlist(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(data.count).toBe(1);
  });

  it('should add product to wishlist', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.wishlistItem.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.wishlistItem.create).mockResolvedValue({
      id: '1',
      userId: 'user1',
      productId: 'prod1',
      createdAt: new Date(),
      product: { id: 'prod1', name: 'Canvas' }
    } as any);

    const request = new NextRequest('http://localhost:3000/api/customer/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId: 'prod1' })
    });
    const response = await addToWishlist(request);

    expect(response.status).toBe(201);
    expect(prisma.wishlistItem.create).toHaveBeenCalled();
  });

  it('should not add duplicate to wishlist', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.wishlistItem.findFirst).mockResolvedValue({
      id: '1',
      userId: 'user1',
      productId: 'prod1',
      createdAt: new Date()
    } as any);

    const request = new NextRequest('http://localhost:3000/api/customer/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId: 'prod1' })
    });
    const response = await removeFromWishlist(request);

    expect(response.status).toBe(400);
  });

  it('should remove product from wishlist', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.wishlistItem.deleteMany).mockResolvedValue({ count: 1 });

    const request = new NextRequest('http://localhost:3000/api/customer/wishlist?productId=prod1', {
      method: 'DELETE'
    });
    const response = await removeFromWishlist(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Reports Export API', () => {
  it('should export orders report as CSV', async () => {
    const mockOrders = [
      {
        id: '1',
        total: 100,
        createdAt: new Date('2026-01-15'),
        status: 'DELIVERED',
        customer: { name: 'John', email: 'john@test.com' },
        items: []
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

    const request = new NextRequest('http://localhost:3000/api/admin/reports/export', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'orders',
        format: 'csv',
        dateRange: { start: '2026-01-01', end: '2026-01-31' }
      })
    });
    const response = await exportReport(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toContain('orders-report');
  });

  it('should export products report as JSON', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Canvas',
        price: 99.99,
        stock: 10,
        category: { name: 'Canvas' },
        _count: { orderItems: 5 }
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

    const request = new NextRequest('http://localhost:3000/api/admin/reports/export', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'products',
        format: 'json'
      })
    });
    const response = await exportReport(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should return 400 for invalid report type', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/reports/export', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'invalid',
        format: 'csv'
      })
    });
    const response = await exportReport(request);

    expect(response.status).toBe(400);
  });
});
