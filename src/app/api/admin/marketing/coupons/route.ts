/**
 * API: Coupons Management
 * GET /api/admin/marketing/coupons - Lista cupoane
 * POST /api/admin/marketing/coupons - Creare cupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data pentru demo (în viitor: Prisma)
const mockCoupons = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    description: 'Reducere 10% pentru clienți noi',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    maxUses: 100,
    usesPerCustomer: 1,
    currentUses: 23,
    minOrderValue: 50,
    excludePromotions: false,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    code: 'FREESHIP',
    type: 'FREE_SHIPPING',
    value: 0,
    description: 'Transport gratuit pentru comenzi peste 200 lei',
    startDate: '2026-01-01',
    maxUses: undefined,
    usesPerCustomer: 1,
    currentUses: 45,
    minOrderValue: 200,
    excludePromotions: false,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    code: 'FLASH50',
    type: 'FIXED_AMOUNT',
    value: 50,
    description: 'Reducere 50 lei - Flash Sale',
    startDate: '2026-01-10',
    endDate: '2026-01-15',
    maxUses: 50,
    usesPerCustomer: 1,
    currentUses: 12,
    minOrderValue: 150,
    excludePromotions: true,
    active: true,
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z',
  },
];

export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Coupons', 'Fetching coupons', { userId: user.id });

    // TODO: Replace with Prisma query
    // const coupons = await prisma.coupon.findMany({
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json(mockCoupons);
  } catch (err) {
    logApiError('API:Coupons', err);
    return createErrorResponse('Failed to fetch coupons', 500);
  }
}

export async function POST(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:Coupons', 'Creating coupon', { userId: user.id, code: body.code });

    // Validare
    if (!body.code || !body.type || body.value === undefined) {
      return createErrorResponse('Missing required fields', 400);
    }

    // Verificare cod duplicat
    const existingCoupon = mockCoupons.find((c) => c.code === body.code);
    if (existingCoupon) {
      return createErrorResponse('Coupon code already exists', 400);
    }

    // TODO: Replace with Prisma create
    // const coupon = await prisma.coupon.create({
    //   data: {
    //     code: body.code,
    //     type: body.type,
    //     value: body.value,
    //     description: body.description,
    //     startDate: body.startDate,
    //     endDate: body.endDate,
    //     maxUses: body.maxUses,
    //     usesPerCustomer: body.usesPerCustomer || 1,
    //     minOrderValue: body.minOrderValue,
    //     categoryIds: body.categoryIds,
    //     productIds: body.productIds,
    //     customerIds: body.customerIds,
    //     excludePromotions: body.excludePromotions || false,
    //     active: true,
    //   },
    // });

    const newCoupon = {
      id: String(mockCoupons.length + 1),
      code: body.code,
      type: body.type,
      value: body.value,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      maxUses: body.maxUses,
      usesPerCustomer: body.usesPerCustomer || 1,
      currentUses: 0,
      minOrderValue: body.minOrderValue,
      categoryIds: body.categoryIds,
      productIds: body.productIds,
      customerIds: body.customerIds,
      excludePromotions: body.excludePromotions || false,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCoupons.push(newCoupon);

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (err) {
    logApiError('API:Coupons', err);
    return createErrorResponse('Failed to create coupon', 500);
  }
}
