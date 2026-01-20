import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    logger.info('API:Production', 'Fetching schedule', { userId: user.id, days });

    // Fetch orders in production or pending
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_PRODUCTION']
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productionTime: true
              }
            }
          }
        },
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate production schedule
    const schedule = orders.map(order => {
      // Calculate estimated production time (sum of all items)
      const totalProductionHours = order.items.reduce((sum, item) => {
        const hoursPerItem = (item.product as any).productionTime || 2; // default 2h
        return sum + (hoursPerItem * item.quantity);
      }, 0);

      // Calculate estimated completion date
      const estimatedCompletion = new Date(order.createdAt);
      estimatedCompletion.setHours(estimatedCompletion.getHours() + totalProductionHours);

      return {
        orderId: order.id,
        customerName: order.customer?.name || order.customerName,
        status: order.status,
        priority: order.priority || 'NORMAL',
        itemCount: order.items.length,
        totalProductionHours,
        estimatedCompletion,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          productionTime: (item.product as any).productionTime || 2
        }))
      };
    });

    // Group by day
    const scheduleByDay: { [key: string]: any[] } = {};
    schedule.forEach(item => {
      const dayKey = item.estimatedCompletion.toISOString().split('T')[0];
      if (!scheduleByDay[dayKey]) {
        scheduleByDay[dayKey] = [];
      }
      scheduleByDay[dayKey].push(item);
    });

    return NextResponse.json({
      schedule,
      scheduleByDay,
      summary: {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        inProductionOrders: orders.filter(o => o.status === 'IN_PRODUCTION').length,
        totalProductionHours: schedule.reduce((sum, s) => sum + s.totalProductionHours, 0)
      }
    });
  } catch (error) {
    logApiError('API:Production', error);
    return createErrorResponse('Failed to fetch production schedule', 500);
  }
}
