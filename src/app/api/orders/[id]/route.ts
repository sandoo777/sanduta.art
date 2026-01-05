import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const GET = withAuth(
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;

      // Fetch specific order with ownership check
      const order = await prisma.order.findFirst({
        where: { 
          id,
          userId: user.id, // Ensure user can only access their own orders
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ order });
    } catch (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
  }
);
