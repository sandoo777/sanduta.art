/**
 * Profitability Reports API Endpoint
 * Returns profit margins, revenue vs costs analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing date range parameters' },
        { status: 400 }
      );
    }

    const dateRange = {
      gte: new Date(from),
      lte: new Date(to)
    };

    logger.info('API:Reports:Profitability', 'Fetching profitability report', { 
      userId: user.id, 
      dateRange 
    });

    // Fetch orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateRange,
        status: 'DELIVERED'
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Estimate costs (simplified - în production ar fi din DB)
    const estimatedCosts = totalRevenue * 0.45; // 45% costs
    const netProfit = totalRevenue - estimatedCosts;
    const totalProfit = netProfit;
    
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - estimatedCosts) / totalRevenue) * 100 : 0;
    const netMargin = grossMargin; // Simplified
    const roi = estimatedCosts > 0 ? (netProfit / estimatedCosts) * 100 : 0;
    const profitGrowth = 8.5; // Mock

    // By product
    const productMap = new Map();
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const key = item.productId;
        const revenue = item.price * item.quantity;
        const cost = revenue * 0.45; // 45% cost estimate
        const profit = revenue - cost;
        
        const current = productMap.get(key) || {
          productId: item.productId,
          productName: item.product.name,
          revenue: 0,
          cost: 0,
          profit: 0
        };
        
        productMap.set(key, {
          ...current,
          revenue: current.revenue + revenue,
          cost: current.cost + cost,
          profit: current.profit + profit
        });
      });
    });

    const byProduct = Array.from(productMap.values())
      .map(p => ({
        ...p,
        profitMargin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0,
        marginPercentage: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit);

    // By category
    const categoryMap = new Map();
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const categoryName = item.product.category?.name || 'Uncategorized';
        const revenue = item.price * item.quantity;
        const cost = revenue * 0.45;
        const profit = revenue - cost;
        
        const current = categoryMap.get(categoryName) || {
          category: categoryName,
          revenue: 0,
          cost: 0,
          profit: 0
        };
        
        categoryMap.set(categoryName, {
          ...current,
          revenue: current.revenue + revenue,
          cost: current.cost + cost,
          profit: current.profit + profit
        });
      });
    });

    const byCategory = Array.from(categoryMap.values())
      .map(c => ({
        ...c,
        profitMargin: c.revenue > 0 ? (c.profit / c.revenue) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit);

    const report = {
      metrics: {
        totalProfit,
        netProfit,
        grossMargin: parseFloat(grossMargin.toFixed(2)),
        netMargin: parseFloat(netMargin.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        profitGrowth,
        averageProfitPerOrder: orders.length > 0 ? netProfit / orders.length : 0
      },
      financial: {
        totalRevenue,
        totalCosts: estimatedCosts,
        netProfit
      },
      byProduct,
      byCategory,
      byCustomer: [],
      byPeriod: []
    };

    return NextResponse.json(report);

  } catch (err) {
    logger.error('API:Reports:Profitability', 'Failed to generate profitability report', { error: err });
    return NextResponse.json(
      { error: 'Failed to generate profitability report' },
      { status: 500 }
    );
  }
}
