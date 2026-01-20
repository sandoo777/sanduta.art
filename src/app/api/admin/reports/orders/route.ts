/**
 * Orders Reports API Endpoint
 * Returns order status, payment, and delivery analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
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

    logger.info('API:Reports:Orders', 'Fetching orders report', { 
      userId: user.id, 
      dateRange 
    });

    const orders = await prisma.order.findMany({
      where: {
        createdAt: dateRange
      },
      include: {
        user: true,
        payment: true,
        delivery: true
      }
    });

    const totalOrders = orders.length;
    const statusCounts = {
      pending: orders.filter(o => o.status === 'PENDING').length,
      inProduction: orders.filter(o => o.status === 'IN_PRODUCTION').length,
      completed: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length
    };

    // Calculate processing times
    const completedOrders = orders.filter(o => o.status === 'DELIVERED' && o.updatedAt);
    const processingTimes = completedOrders.map(o => {
      const diff = o.updatedAt.getTime() - o.createdAt.getTime();
      return diff / (1000 * 60 * 60); // hours
    });
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

    const completionRate = totalOrders > 0
      ? (statusCounts.completed / totalOrders) * 100
      : 0;

    // Delayed orders (assuming 7 days is standard)
    const delayedOrders = orders.filter(o => {
      const daysSinceCreation = (Date.now() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation > 7 && o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    }).map(o => ({
      orderId: o.id,
      customerName: o.user?.name || o.user?.email || 'Guest',
      status: o.status,
      daysDelayed: Math.floor((Date.now() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)) - 7,
      delayDays: Math.floor((Date.now() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)) - 7,
      delayReason: 'Production delay',
      estimatedDelivery: new Date(o.createdAt.getTime() + 10 * 24 * 60 * 60 * 1000)
    }));

    // Status distribution
    const byStatus = [
      { status: 'PENDING', count: statusCounts.pending, percentage: totalOrders > 0 ? (statusCounts.pending / totalOrders) * 100 : 0 },
      { status: 'IN_PRODUCTION', count: statusCounts.inProduction, percentage: totalOrders > 0 ? (statusCounts.inProduction / totalOrders) * 100 : 0 },
      { status: 'DELIVERED', count: statusCounts.completed, percentage: totalOrders > 0 ? (statusCounts.completed / totalOrders) * 100 : 0 },
      { status: 'CANCELLED', count: statusCounts.cancelled, percentage: totalOrders > 0 ? (statusCounts.cancelled / totalOrders) * 100 : 0 }
    ];

    // Payment analysis
    const paymentAnalysis = [
      {
        status: 'PAID',
        count: orders.filter(o => o.payment?.status === 'PAID').length,
        totalAmount: orders.filter(o => o.payment?.status === 'PAID').reduce((sum, o) => sum + o.total, 0)
      },
      {
        status: 'PENDING',
        count: orders.filter(o => o.payment?.status === 'PENDING').length,
        totalAmount: orders.filter(o => o.payment?.status === 'PENDING').reduce((sum, o) => sum + o.total, 0)
      },
      {
        status: 'FAILED',
        count: orders.filter(o => o.payment?.status === 'FAILED').length,
        totalAmount: orders.filter(o => o.payment?.status === 'FAILED').reduce((sum, o) => sum + o.total, 0)
      }
    ];

    // Delivery analysis
    const deliveryAnalysis = [
      {
        method: 'Nova Poshta',
        count: orders.filter(o => o.delivery?.method === 'NOVA_POSHTA').length,
        percentage: totalOrders > 0 ? (orders.filter(o => o.delivery?.method === 'NOVA_POSHTA').length / totalOrders) * 100 : 0,
        averageDeliveryTime: 48
      },
      {
        method: 'Pickup',
        count: orders.filter(o => o.delivery?.method === 'PICKUP').length,
        percentage: totalOrders > 0 ? (orders.filter(o => o.delivery?.method === 'PICKUP').length / totalOrders) * 100 : 0,
        averageDeliveryTime: 24
      }
    ];

    const report = {
      metrics: {
        totalOrders,
        ...statusCounts,
        delayedOrders: delayedOrders.length,
        averageCompletionTime: averageProcessingTime,
        averageProcessingTime,
        completionRate: parseFloat(completionRate.toFixed(2))
      },
      byStatus,
      paymentAnalysis,
      deliveryAnalysis,
      byPaymentMethod: paymentAnalysis,
      byDeliveryMethod: deliveryAnalysis,
      delayedOrders
    };

    return NextResponse.json(report);

  } catch (err) {
    logger.error('API:Reports:Orders', 'Failed to generate orders report', { error: err });
    return NextResponse.json(
      { error: 'Failed to generate orders report' },
      { status: 500 }
    );
  }
}
