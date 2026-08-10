import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () => ({
    user: {
      id: 'integration-admin',
      role: 'ADMIN',
      email: 'admin@integration.local',
    },
  })),
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireRole: vi.fn(async () => ({
    user: { id: 'integration-admin', role: 'ADMIN' },
    error: null,
  })),
}));

vi.mock('@/lib/auth-middleware', () => ({
  withRole: (_roles: unknown, handler: (request: NextRequest, context: unknown) => Promise<Response>) => {
    return async (request: NextRequest, context: unknown) => {
      const contextWithUser = {
        ...(context as Record<string, unknown>),
        user: { id: 'integration-admin', role: 'ADMIN' },
      };
      return handler(request, contextWithUser);
    };
  },
}));

import { GET as getProductionJobs, POST as createProductionJob } from '@/app/api/admin/production/route';
import { PATCH as updateProductionJob } from '@/app/api/admin/production/[id]/route';
import { GET as getPrintMethods } from '@/app/api/admin/print-methods/route';
import { GET as getMaterials } from '@/app/api/admin/materials/route';
import { GET as getMachineSuggestions } from '@/app/api/admin/machines/suggest/route';
import { GET as getOrders } from '@/app/api/admin/orders/route';

const runIntegration = process.env.INTEGRATION_DB_TESTS === 'true';
const describeIf = runIntegration ? describe : describe.skip;

function makeRequest(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(url, init);
}

describeIf('Production API integration (DB-backed)', () => {
  const runId = `integration-${Date.now()}`;
  let customerId = '';
  let categoryId = '';
  let productId = '';
  let orderId = '';
  let createdJobId = '';

  beforeAll(async () => {
    const customer = await prisma.customer.create({
      data: {
        name: `Integration Customer ${runId}`,
        email: `${runId}@example.com`,
      },
    });
    customerId = customer.id;

    const category = await prisma.category.create({
      data: {
        name: `Integration Category ${runId}`,
        slug: `integration-category-${runId}`,
      },
    });
    categoryId = category.id;

    const product = await prisma.product.create({
      data: {
        name: `Integration Product ${runId}`,
        slug: `integration-product-${runId}`,
        categoryId,
        price: 120,
      },
    });
    productId = product.id;

    const order = await prisma.order.create({
      data: {
        customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        totalPrice: 120,
        orderItems: {
          create: [
            {
              productId,
              quantity: 1,
              unitPrice: 120,
              lineTotal: 120,
            },
          ],
        },
      },
    });
    orderId = order.id;
  });

  afterAll(async () => {
    await prisma.productionJob.deleteMany({ where: { orderId } });
    await prisma.order.deleteMany({ where: { id: orderId } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
  });

  it('lists production jobs', async () => {
    const response = await getProductionJobs(makeRequest('http://localhost/api/admin/production'));
    expect(response.status).toBe(200);

    const payload = await response.json() as { jobs: Array<{ id: string }> };
    expect(Array.isArray(payload.jobs)).toBe(true);
  });

  it('creates production job for a real order', async () => {
    const response = await createProductionJob(
      makeRequest('http://localhost/api/admin/production', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId,
          productId,
          name: `Integration Job ${runId}`,
          priority: 'NORMAL',
        }),
      })
    );

    expect(response.status).toBe(201);
    const payload = await response.json() as { id: string };
    expect(payload.id).toBeTruthy();
    createdJobId = payload.id;
  });

  it('updates production status with valid transition', async () => {
    const response = await updateProductionJob(
      makeRequest(`http://localhost/api/admin/production/${createdJobId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      }),
      { params: Promise.resolve({ id: createdJobId }) } as never
    );

    expect(response.status).toBe(200);
    const payload = await response.json() as { status: string };
    expect(payload.status).toBe('IN_PROGRESS');
  });

  it('keeps modal dependency endpoints available', async () => {
    const printMethodsResponse = await getPrintMethods(makeRequest('http://localhost/api/admin/print-methods?active=true'));
    const materialsResponse = await getMaterials(makeRequest('http://localhost/api/admin/materials'));
    const machineSuggestionsResponse = await getMachineSuggestions(makeRequest('http://localhost/api/admin/machines/suggest'));
    const ordersResponse = await getOrders(makeRequest('http://localhost/api/admin/orders?limit=5'));

    expect(printMethodsResponse.status).toBeLessThan(500);
    expect(materialsResponse.status).toBeLessThan(500);
    expect(machineSuggestionsResponse.status).toBeLessThan(500);
    expect(ordersResponse.status).toBeLessThan(500);
  });
});
