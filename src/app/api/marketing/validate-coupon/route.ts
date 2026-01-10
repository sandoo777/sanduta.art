/**
 * API: Validate Coupon (Public)
 * POST /api/marketing/validate-coupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
const mockCoupons = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    minOrderValue: 50,
    maxUses: 100,
    currentUses: 23,
    usesPerCustomer: 1,
    excludePromotions: false,
  },
  {
    id: '2',
    code: 'FREESHIP',
    type: 'FREE_SHIPPING',
    value: 0,
    active: true,
    startDate: '2026-01-01',
    minOrderValue: 200,
    usesPerCustomer: 1,
    currentUses: 45,
    excludePromotions: false,
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId, cartTotal, productIds, categoryIds } = body;

    logger.info('API:ValidateCoupon', 'Validating coupon', { code, cartTotal });

    // TODO: Replace with Prisma query
    // const coupon = await prisma.coupon.findUnique({
    //   where: { code },
    //   include: { usages: { where: { userId } } },
    // });

    const coupon = mockCoupons.find((c) => c.code === code);

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        error: 'Cupon invalid',
      });
    }

    // Verificări
    if (!coupon.active) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        error: 'Cuponul este inactiv',
      });
    }

    // Check expirare
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        error: 'Cuponul a expirat',
      });
    }

    // Check utilizări maxime
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        error: 'Cuponul a fost folosit de numărul maxim de ori',
      });
    }

    // Check valoare minimă
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        error: `Comandă minimă: ${coupon.minOrderValue} lei`,
      });
    }

    // TODO: Check utilizări per client
    // if (userId) {
    //   const userUsages = await prisma.couponUsage.count({
    //     where: { couponId: coupon.id, userId },
    //   });
    //   if (userUsages >= coupon.usesPerCustomer) {
    //     return NextResponse.json({
    //       valid: false,
    //       discount: 0,
    //       error: 'Ai folosit deja acest cupon',
    //     });
    //   }
    // }

    // Calculează reducerea
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (cartTotal * coupon.value) / 100;
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discount = coupon.value;
    }

    return NextResponse.json({
      valid: true,
      coupon,
      discount,
      message: `Cupon aplicat: -${coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `${coupon.value} lei`}`,
    });
  } catch (err) {
    logApiError('API:ValidateCoupon', err);
    return createErrorResponse('Failed to validate coupon', 500);
  }
}
