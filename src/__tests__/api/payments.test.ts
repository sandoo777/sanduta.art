import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/modules/auth/nextauth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderTimeline: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/paynet', () => ({
  paynetClient: {
    createSession: vi.fn(),
    verifyWebhook: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logApiError: vi.fn(),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makePost = (url: string, body: unknown) =>
  new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const ORDER = {
  id: 'order-1',
  orderNumber: 'ORD-001',
  totalPrice: 150,
  customerEmail: 'test@test.com',
  customerName: 'Test User',
  paymentStatus: 'PENDING',
  paynetSessionId: null,
};

// ─── POST /api/payments/initiate ─────────────────────────────────────────────

describe('POST /api/payments/initiate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when orderId is missing', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);

    const { POST } = await import('@/app/api/payments/initiate/route');
    const res = await POST(makePost('http://localhost/api/payments/initiate', {}));
    expect(res.status).toBe(400);
  });

  it('returns 404 when order not found', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

    const { POST } = await import('@/app/api/payments/initiate/route');
    const res = await POST(makePost('http://localhost/api/payments/initiate', { orderId: 'bad' }));
    expect(res.status).toBe(404);
  });

  it('returns alreadyPaid when order is already PAID', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ ...ORDER, paymentStatus: 'PAID' } as never);

    const { POST } = await import('@/app/api/payments/initiate/route');
    const res = await POST(makePost('http://localhost/api/payments/initiate', { orderId: 'order-1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.alreadyPaid).toBe(true);
  });

  it('creates Paynet session and returns paymentIntentId', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findFirst).mockResolvedValue(ORDER as never);
    vi.mocked(prisma.order.update).mockResolvedValue(ORDER as never);
    vi.mocked(prisma.orderTimeline.create).mockResolvedValue({} as never);

    const { paynetClient } = await import('@/lib/paynet');
    vi.mocked(paynetClient.createSession).mockResolvedValue({
      session_id: 'sess-abc',
      payment_url: 'https://paynet.example.com/pay/sess-abc',
      status: 'pending',
    });

    const { POST } = await import('@/app/api/payments/initiate/route');
    const res = await POST(makePost('http://localhost/api/payments/initiate', { orderId: 'order-1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.paymentIntentId).toBe('sess-abc');
    expect(body.paymentUrl).toBe('https://paynet.example.com/pay/sess-abc');
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { paynetSessionId: 'sess-abc' },
    });
    expect(prisma.orderTimeline.create).toHaveBeenCalledOnce();
  });

  it('falls back to COD when Paynet is unavailable', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findFirst).mockResolvedValue(ORDER as never);

    const { paynetClient } = await import('@/lib/paynet');
    vi.mocked(paynetClient.createSession).mockRejectedValue(new Error('Network error'));

    const { POST } = await import('@/app/api/payments/initiate/route');
    const res = await POST(makePost('http://localhost/api/payments/initiate', { orderId: 'order-1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.fallback).toBe('cod');
    expect(body.paymentUrl).toContain('/checkout/success');
  });

  it('reuses existing paynetSessionId (idempotent)', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findFirst).mockResolvedValue({
      ...ORDER,
      paynetSessionId: 'sess-existing',
    } as never);

    const { paynetClient } = await import('@/lib/paynet');

    const { POST } = await import('@/app/api/payments/initiate/route');
    const res = await POST(makePost('http://localhost/api/payments/initiate', { orderId: 'order-1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.paymentIntentId).toBe('sess-existing');
    expect(paynetClient.createSession).not.toHaveBeenCalled();
  });
});

// ─── POST /api/payment/paynet/webhook ────────────────────────────────────────

describe('POST /api/payment/paynet/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeWebhookRequest = (body: unknown, sig: string) =>
    new NextRequest('http://localhost/api/payment/paynet/webhook', {
      method: 'POST',
      headers: { 'x-signature': sig },
      body: JSON.stringify(body),
    });

  it('returns 401 for invalid signature', async () => {
    const { paynetClient } = await import('@/lib/paynet');
    vi.mocked(paynetClient.verifyWebhook).mockResolvedValue(false);

    const { POST } = await import('@/app/api/payment/paynet/webhook/route');
    const res = await POST(makeWebhookRequest({ session_id: 's', order_id: 'o', status: 'completed' }, 'bad-sig'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when order does not exist', async () => {
    const { paynetClient } = await import('@/lib/paynet');
    vi.mocked(paynetClient.verifyWebhook).mockResolvedValue(true);

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const { POST } = await import('@/app/api/payment/paynet/webhook/route');
    const res = await POST(makeWebhookRequest({ session_id: 's', order_id: 'order-1', status: 'completed' }, 'sig'));
    expect(res.status).toBe(404);
  });

  it('marks order as PAID and moves to IN_PREPRODUCTION on completed', async () => {
    const { paynetClient } = await import('@/lib/paynet');
    vi.mocked(paynetClient.verifyWebhook).mockResolvedValue(true);

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: 'order-1', paymentStatus: 'PENDING' } as never);
    vi.mocked(prisma.order.update).mockResolvedValue({} as never);
    vi.mocked(prisma.orderTimeline.create).mockResolvedValue({} as never);

    const { POST } = await import('@/app/api/payment/paynet/webhook/route');
    const res = await POST(makeWebhookRequest({ session_id: 'sess-1', order_id: 'order-1', status: 'completed' }, 'sig'));

    expect(res.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { paymentStatus: 'PAID', status: 'IN_PREPRODUCTION' },
    });
    expect(prisma.orderTimeline.create).toHaveBeenCalledOnce();
    const timelineCall = vi.mocked(prisma.orderTimeline.create).mock.calls[0][0];
    expect(timelineCall.data.eventType).toBe('payment_update');
    expect(timelineCall.data.eventData).toMatchObject({ newPaymentStatus: 'PAID' });
  });

  it('marks order as FAILED on failed status', async () => {
    const { paynetClient } = await import('@/lib/paynet');
    vi.mocked(paynetClient.verifyWebhook).mockResolvedValue(true);

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: 'order-1', paymentStatus: 'PENDING' } as never);
    vi.mocked(prisma.order.update).mockResolvedValue({} as never);
    vi.mocked(prisma.orderTimeline.create).mockResolvedValue({} as never);

    const { POST } = await import('@/app/api/payment/paynet/webhook/route');
    const res = await POST(makeWebhookRequest({ session_id: 'sess-1', order_id: 'order-1', status: 'failed' }, 'sig'));

    expect(res.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { paymentStatus: 'FAILED', status: 'PENDING' },
    });
  });
});
