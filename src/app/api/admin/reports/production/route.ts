/**
 * Production Reports API Endpoint
 * Returns production efficiency, job tracking, and bottleneck analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getColorModeLabel } from '@/modules/print-methods/colorModes';

export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const searchParams = _req.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const colorMode = searchParams.get('colorMode');
    
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

    logger.info('API:Reports:Production', 'Fetching production report', { 
      userId: user.id, 
      dateRange 
    });

    const jobWhere: Prisma.ProductionJobWhereInput = {
      createdAt: dateRange,
      ...(colorMode
        ? {
            printMethod: {
              is: {
                colorMode,
              },
            },
          }
        : {}),
    };

    // Fetch production jobs with entities needed for color mode analytics
    const jobs = await prisma.productionJob.findMany({
      where: jobWhere,
      include: {
        assignedTo: true,
        machine: {
          select: {
            id: true,
            name: true,
          },
        },
        printMethod: {
          select: {
            id: true,
            colorMode: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
          },
        },
        order: {
          select: {
            totalPrice: true,
          },
        },
        consumption: {
          select: {
            quantity: true,
            totalUsed: true,
            cost: true,
            materialId: true,
            material: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      }
    });

    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
    const delayedJobs = jobs.filter(j => j.dueDate && new Date() > j.dueDate && j.status !== 'COMPLETED' && j.status !== 'CANCELED').length;

    const completedWithTimes = jobs.filter(j => j.status === 'COMPLETED' && j.startedAt && j.completedAt);
    const avgActual = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, j) => {
          const minutes = (new Date(j.completedAt as Date).getTime() - new Date(j.startedAt as Date).getTime()) / (1000 * 60);
          return sum + Math.max(0, minutes);
        }, 0) / completedWithTimes.length
      : 0;
    const jobsWithEstimate = jobs.filter(j => typeof j.estimatedMinutes === 'number' && j.estimatedMinutes > 0);
    const avgEstimated = jobsWithEstimate.length > 0
      ? jobsWithEstimate.reduce((sum, j) => sum + Number(j.estimatedMinutes ?? 0), 0) / jobsWithEstimate.length
      : 0;
    const efficiency = avgEstimated > 0 ? Math.min(200, Math.max(0, (avgEstimated / Math.max(avgActual, 1)) * 100)) : 100;
    const productionEfficiency = efficiency;
    const efficiencyTrend = 0;

    const daysDiff = (dateRange.lte.getTime() - dateRange.gte.getTime()) / (1000 * 60 * 60 * 24);
    const jobsPerDay = daysDiff > 0 ? totalJobs / daysDiff : 0;

    // Status distribution
    const byStatus = [
      { status: 'PENDING', count: jobs.filter(j => j.status === 'PENDING').length, percentage: 0, averageTime: 0 },
      { status: 'IN_PROGRESS', count: jobs.filter(j => j.status === 'IN_PROGRESS').length, percentage: 0, averageTime: 0 },
      { status: 'COMPLETED', count: completedJobs, percentage: 0, averageTime: avgActual },
      { status: 'CANCELLED', count: jobs.filter(j => j.status === 'CANCELLED').length, percentage: 0, averageTime: 0 }
    ].map(s => ({
      ...s,
      percentage: totalJobs > 0 ? (s.count / totalJobs) * 100 : 0
    }));

    const machineMap = new Map<string, { machineId: string; machineName: string; jobs: number; completedJobs: number; delayedJobs: number; totalEstimatedMinutes: number; totalActualMinutes: number }>();
    jobs.forEach(job => {
      if (!job.machineId || !job.machine) return;

      const current = machineMap.get(job.machineId) || {
        machineId: job.machineId,
        machineName: job.machine.name,
        jobs: 0,
        completedJobs: 0,
        delayedJobs: 0,
        totalEstimatedMinutes: 0,
        totalActualMinutes: 0,
      };

      current.jobs += 1;
      if (job.status === 'COMPLETED') current.completedJobs += 1;
      if (job.dueDate && new Date() > job.dueDate && job.status !== 'COMPLETED' && job.status !== 'CANCELED') {
        current.delayedJobs += 1;
      }
      if (job.estimatedMinutes) current.totalEstimatedMinutes += Number(job.estimatedMinutes);
      if (job.startedAt && job.completedAt) {
        current.totalActualMinutes += (new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / (1000 * 60);
      }

      machineMap.set(job.machineId, current);
    });

    const byMachine = Array.from(machineMap.values()).map(machine => ({
      ...machine,
      averageEstimatedMinutes: machine.jobs > 0 ? machine.totalEstimatedMinutes / machine.jobs : 0,
      averageActualMinutes: machine.completedJobs > 0 ? machine.totalActualMinutes / machine.completedJobs : 0,
    }));

    // By operator
    const operatorMap = new Map();
    jobs.forEach(job => {
      if (job.assignedTo) {
        const key = job.assignedToId;
        const current = operatorMap.get(key) || {
          operatorId: job.assignedToId,
          operatorName: job.assignedTo.name,
          jobsCompleted: 0,
          averageTime: 0,
          workHours: 0,
          jobsPerHour: 0,
          productivityRate: 0,
          accuracyRate: 0
        };
        operatorMap.set(key, {
          ...current,
          jobsCompleted: current.jobsCompleted + 1,
          productivityRate: current.jobsCompleted > 0
            ? (current.jobsCompleted / Math.max(totalJobs, 1)) * 100
            : 0,
          accuracyRate: 100
        });
      }
    });

    const byOperator = Array.from(operatorMap.values()).map((o: { workHours: number; jobsCompleted: number }) => ({
      ...o,
      averageTime: o.workHours / (o.jobsCompleted || 1),
      jobsPerHour: o.workHours > 0 ? o.jobsCompleted / o.workHours : 0
    }));

    const colorModeMap = new Map<string, {
      colorMode: string;
      label: string;
      jobs: number;
      completedJobs: number;
      estimatedMinutes: number;
      actualMinutes: number;
      estimatedCost: number;
      actualCost: number;
      revenue: number;
      materialConsumption: number;
      materialCost: number;
      materialsUsed: Set<string>;
    }>();

    jobs.forEach((job) => {
      const mode = job.printMethod?.colorMode ?? 'UNSPECIFIED';
      const current = colorModeMap.get(mode) || {
        colorMode: mode,
        label: mode === 'UNSPECIFIED' ? 'Nespecificat' : getColorModeLabel(mode),
        jobs: 0,
        completedJobs: 0,
        estimatedMinutes: 0,
        actualMinutes: 0,
        estimatedCost: 0,
        actualCost: 0,
        revenue: 0,
        materialConsumption: 0,
        materialCost: 0,
        materialsUsed: new Set<string>(),
      };

      current.jobs += 1;
      if (job.status === 'COMPLETED') current.completedJobs += 1;
      current.estimatedMinutes += Number(job.estimatedMinutes ?? 0);
      current.estimatedCost += Number(job.estimatedCost ?? 0);
      current.actualCost += Number((job as { actualCost?: unknown }).actualCost ?? 0);
      current.revenue += Number(job.order?.totalPrice ?? 0);

      if (job.startedAt && job.completedAt) {
        current.actualMinutes += (new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / (1000 * 60);
      }

      for (const usage of job.consumption) {
        current.materialConsumption += Number(usage.totalUsed ?? usage.quantity ?? 0);
        current.materialCost += Number(usage.cost ?? 0);
        if (usage.material?.name) {
          current.materialsUsed.add(usage.material.name);
        }
      }

      colorModeMap.set(mode, current);
    });

    const byColorMode = Array.from(colorModeMap.values()).map((item) => {
      const effectiveCost = item.actualCost > 0 ? item.actualCost : item.estimatedCost + item.materialCost;
      const profit = item.revenue - effectiveCost;

      return {
        colorMode: item.colorMode,
        label: item.label,
        jobs: item.jobs,
        completedJobs: item.completedJobs,
        avgEstimatedMinutes: item.jobs > 0 ? item.estimatedMinutes / item.jobs : 0,
        avgActualMinutes: item.completedJobs > 0 ? item.actualMinutes / item.completedJobs : 0,
        estimatedCost: item.estimatedCost,
        materialCost: item.materialCost,
        totalCost: effectiveCost,
        revenue: item.revenue,
        profit,
        marginPercent: item.revenue > 0 ? (profit / item.revenue) * 100 : 0,
        totalMaterialConsumption: item.materialConsumption,
        materialsUsed: Array.from(item.materialsUsed),
      };
    });

    // Bottlenecks (mock)
    const bottlenecks = delayedJobs > 0 ? [
      {
        stage: 'Printing',
        description: 'High volume causing delays',
        averageDelay: 2.5,
        jobsAffected: delayedJobs,
        affectedJobs: delayedJobs,
        impact: 35,
        recommendation: 'Add second printing machine or extend shifts'
      }
    ] : [];

    const report = {
      metrics: {
        totalJobs,
        completedJobs,
        delayedJobs,
        averageActualTime: avgActual,
        averageEstimatedTime: avgEstimated,
        averageProductionTime: avgActual,
        efficiency: parseFloat(efficiency.toFixed(2)),
        productionEfficiency: parseFloat(productionEfficiency.toFixed(2)),
        efficiencyTrend: parseFloat(efficiencyTrend.toFixed(2)),
        jobsPerDay: parseFloat(jobsPerDay.toFixed(2))
      },
      byStatus,
      byMachine,
      byOperator,
      byColorMode,
      bottlenecks,
      actualVsEstimated: []
    };

    return NextResponse.json(report);

  } catch (err) {
    logger.error('API:Reports:Production', 'Failed to generate production report', { error: err });
    return NextResponse.json(
      { error: 'Failed to generate production report' },
      { status: 500 }
    );
  }
}
