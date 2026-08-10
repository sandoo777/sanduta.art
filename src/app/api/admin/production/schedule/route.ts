import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { ProductionPriority } from '@prisma/client';

interface SchedulableItem {
  productName: string;
  quantity: number;
  productionTime: number;
}

interface ScheduleEntry {
  orderId: string;
  customerName: string | null;
  status: string;
  priority: string;
  itemCount: number;
  totalProductionHours: number;
  estimatedCompletion: Date;
  createdAt: Date;
  items: SchedulableItem[];
}

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
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        productionJobs: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS', 'ON_HOLD']
            }
          },
          select: {
            estimatedMinutes: true,
            priority: true,
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
      const estimatedHoursFromJobs = order.productionJobs.reduce((sum, job) => {
        return sum + ((job.estimatedMinutes ?? 0) / 60);
      }, 0);

      // Fallback when jobs have no estimate yet.
      const totalProductionHours = estimatedHoursFromJobs > 0
        ? estimatedHoursFromJobs
        : order.orderItems.reduce((sum, item) => sum + (2 * item.quantity), 0);

      const priorityRank: Record<ProductionPriority, number> = {
        LOW: 1,
        NORMAL: 2,
        HIGH: 3,
        URGENT: 4,
      };

      const derivedPriority = order.productionJobs.reduce<ProductionPriority>((current, job) => {
        return priorityRank[job.priority] > priorityRank[current] ? job.priority : current;
      }, ProductionPriority.NORMAL);

      // Calculate estimated completion date
      const estimatedCompletion = new Date(order.createdAt);
      estimatedCompletion.setHours(estimatedCompletion.getHours() + totalProductionHours);

      return {
        orderId: order.id,
        customerName: order.customer?.name || order.customerName,
        status: order.status,
        priority: derivedPriority,
        itemCount: order.orderItems.length,
        totalProductionHours,
        estimatedCompletion,
        createdAt: order.createdAt,
        items: order.orderItems.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          productionTime: 2
        }))
      };
    });

    // Group by day
    const scheduleByDay: Record<string, ScheduleEntry[]> = {};
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
