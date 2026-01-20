import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getRevenue } from '@/app/api/admin/stats/revenue/route';
import { GET as getSchedule } from '@/app/api/admin/production/schedule/route';
import { GET as getLowStock } from '@/app/api/admin/inventory/low-stock/route';

// Mock auth
vi.mock('@/lib/auth-helpers', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: { id: 'user1', role: 'ADMIN', email: 'admin@test.com' },
    error: null
  })
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn()
    },
    product: {
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

describe('Revenue Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate revenue for 30 days period', async () => {
    const mockOrders = [
      {
        id: '1',
        total: 100,
        createdAt: new Date('2026-01-15'),
        status: 'DELIVERED'
      },
      {
        id: '2',
        total: 200,
        createdAt: new Date('2026-01-16'),
        status: 'DELIVERED'
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);

    const request = new NextRequest('http://localhost:3000/api/admin/stats/revenue?period=30days');
    const response = await getRevenue(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary.totalRevenue).toBe(300);
    expect(data.summary.totalOrders).toBe(2);
    expect(data.summary.averageOrderValue).toBe(150);
    expect(data.chartData).toBeDefined();
  });

  it('should group by day correctly', async () => {
    const mockOrders = [
      { id: '1', total: 100, createdAt: new Date('2026-01-15'), status: 'DELIVERED' },
      { id: '2', total: 150, createdAt: new Date('2026-01-15'), status: 'DELIVERED' },
      { id: '3', total: 200, createdAt: new Date('2026-01-16'), status: 'DELIVERED' }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);

    const request = new NextRequest('http://localhost:3000/api/admin/stats/revenue?groupBy=day');
    const response = await getRevenue(request);
    const data = await response.json();

    expect(data.chartData).toHaveLength(2);
    expect(data.chartData[0].revenue).toBe(250); // 100 + 150
    expect(data.chartData[1].revenue).toBe(200);
  });
});

describe('Production Schedule API', () => {
  it('should calculate production schedule', async () => {
    const mockOrders = [
      {
        id: '1',
        status: 'IN_PRODUCTION',
        createdAt: new Date('2026-01-15'),
        priority: 'HIGH',
        customer: { name: 'John Doe', email: 'john@test.com' },
        customerName: 'John Doe',
        items: [
          {
            quantity: 2,
            product: { id: 'p1', name: 'Canvas', productionTime: 3 }
          }
        ]
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);

    const request = new NextRequest('http://localhost:3000/api/admin/production/schedule');
    const response = await getSchedule(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedule).toHaveLength(1);
    expect(data.schedule[0].totalProductionHours).toBe(6); // 2 * 3
    expect(data.summary.totalOrders).toBe(1);
    expect(data.summary.inProductionOrders).toBe(1);
  });
});

describe('Low Stock API', () => {
  it('should return low stock products', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Canvas A4',
        sku: 'CAN-A4',
        stock: 3,
        price: 50,
        updatedAt: new Date(),
        category: { id: 'cat1', name: 'Canvas' },
        _count: { orderItems: 10 }
      },
      {
        id: '2',
        name: 'Poster A3',
        sku: 'POS-A3',
        stock: 0,
        price: 30,
        updatedAt: new Date(),
        category: { id: 'cat2', name: 'Posters' },
        _count: { orderItems: 5 }
      }
    ];

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);

    const request = new NextRequest('http://localhost:3000/api/admin/inventory/low-stock?threshold=10');
    const response = await getLowStock(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toHaveLength(2);
    expect(data.products[0].status).toBe('CRITICAL');
    expect(data.products[1].status).toBe('OUT_OF_STOCK');
    expect(data.summary.outOfStock).toBe(1);
    expect(data.summary.critical).toBe(1);
  });

  it('should use default threshold of 10', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/admin/inventory/low-stock');
    const response = await getLowStock(request);
    const data = await response.json();

    expect(data.threshold).toBe(10);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          stock: { lte: 10 }
        }
      })
    );
  });
});
