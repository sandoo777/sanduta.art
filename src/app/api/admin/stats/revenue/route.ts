import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days'; // 7days, 30days, 90days, year
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    logger.info('API:Stats', 'Fetching revenue stats', { userId: user.id, period, groupBy });

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        },
        status: {
          in: ['CONFIRMED', 'IN_PRODUCTION', 'DELIVERED']
        }
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        status: true
      }
    });

    // Group by period
    const revenueByPeriod: { [key: string]: number } = {};
    const ordersByPeriod: { [key: string]: number } = {};

    orders.forEach(order => {
      let key = '';
      const date = new Date(order.createdAt);

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + order.total;
      ordersByPeriod[key] = (ordersByPeriod[key] || 0) + 1;
    });

    // Calculate totals and averages
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Format response
    const chartData = Object.keys(revenueByPeriod).sort().map(key => ({
      period: key,
      revenue: revenueByPeriod[key],
      orders: ordersByPeriod[key]
    }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        period,
        startDate,
        endDate: now
      },
      chartData
    });
  } catch (error) {
    logApiError('API:Stats', error);
    return createErrorResponse('Failed to fetch revenue stats', 500);
  }
}
