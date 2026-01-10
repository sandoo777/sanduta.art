/**
 * API: Coupon Operations
 * PATCH /api/admin/marketing/coupons/[id] - Actualizare cupon
 * DELETE /api/admin/marketing/coupons/[id] - Ștergere cupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data (shared with route.ts în memorie - în production ar fi Prisma)
const mockCoupons: any[] = [];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    logger.info('API:Coupons', 'Updating coupon', { userId: user.id, couponId: id });

    // TODO: Replace with Prisma update
    // const coupon = await prisma.coupon.update({
    //   where: { id },
    //   data: {
    //     ...body,
    //     updatedAt: new Date(),
    //   },
    // });

    // Mock implementation
    const couponIndex = mockCoupons.findIndex((c) => c.id === id);
    if (couponIndex === -1) {
      return createErrorResponse('Coupon not found', 404);
    }

    mockCoupons[couponIndex] = {
      ...mockCoupons[couponIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockCoupons[couponIndex]);
  } catch (err) {
    logApiError('API:Coupons', err);
    return createErrorResponse('Failed to update coupon', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    logger.info('API:Coupons', 'Deleting coupon', { userId: user.id, couponId: id });

    // TODO: Replace with Prisma delete
    // await prisma.coupon.delete({ where: { id } });

    // Mock implementation
    const couponIndex = mockCoupons.findIndex((c) => c.id === id);
    if (couponIndex === -1) {
      return createErrorResponse('Coupon not found', 404);
    }

    mockCoupons.splice(couponIndex, 1);

    return NextResponse.json({ success: true });
  } catch (err) {
    logApiError('API:Coupons', err);
    return createErrorResponse('Failed to delete coupon', 500);
  }
}
