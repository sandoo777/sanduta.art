/**
 * Cost Reports API Endpoint
 * Returns material costs, labor costs, and expense tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

    logger.info('API:Reports:Costs', 'Fetching costs report', { 
      userId: user.id, 
      dateRange 
    });

    // Fetch material usage
    const materialUsage = await prisma.materialUsage.findMany({
      where: {
        usedAt: dateRange
      },
      include: {
        material: true
      }
    });

    // Fetch production jobs for labor costs
    const jobs = await prisma.productionJob.findMany({
      where: {
        createdAt: dateRange
      },
      include: {
        operator: true
      }
    });

    // Calculate costs
    const materialsCost = materialUsage.reduce((sum, usage) => {
      return sum + (usage.material.pricePerUnit * usage.quantityUsed);
    }, 0);

    const laborCost = jobs.reduce((sum, job) => {
      const hourlyRate = 50; // RON per hour
      return sum + (job.actualTime || 0) * hourlyRate;
    }, 0);

    const equipmentCost = jobs.length * 20; // Mock: 20 RON per job
    const overheadCost = (materialsCost + laborCost + equipmentCost) * 0.15; // 15% overhead

    const totalCosts = materialsCost + laborCost + equipmentCost + overheadCost;
    const costTrend = -3.2; // Mock: 3.2% reduction

    // By category
    const byCategory = [
      { category: 'Materiale', amount: materialsCost, percentage: totalCosts > 0 ? (materialsCost / totalCosts) * 100 : 0 },
      { category: 'Manoperă', amount: laborCost, percentage: totalCosts > 0 ? (laborCost / totalCosts) * 100 : 0 },
      { category: 'Echipamente', amount: equipmentCost, percentage: totalCosts > 0 ? (equipmentCost / totalCosts) * 100 : 0 },
      { category: 'Overhead', amount: overheadCost, percentage: totalCosts > 0 ? (overheadCost / totalCosts) * 100 : 0 }
    ];

    // Top materials
    const materialMap = new Map();
    materialUsage.forEach(usage => {
      const key = usage.materialId;
      const current = materialMap.get(key) || {
        materialName: usage.material.name,
        quantity: 0,
        totalCost: 0
      };
      materialMap.set(key, {
        ...current,
        quantity: current.quantity + usage.quantityUsed,
        totalCost: current.totalCost + (usage.material.pricePerUnit * usage.quantityUsed)
      });
    });

    const topMaterials = Array.from(materialMap.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);

    // Labor by operator
    const operatorMap = new Map();
    jobs.forEach(job => {
      if (job.operator) {
        const key = job.operatorId;
        const current = operatorMap.get(key) || {
          operatorName: job.operator.name,
          hoursWorked: 0,
          totalCost: 0
        };
        const hourlyRate = 50;
        operatorMap.set(key, {
          ...current,
          hoursWorked: current.hoursWorked + (job.actualTime || 0),
          totalCost: current.totalCost + ((job.actualTime || 0) * hourlyRate)
        });
      }
    });

    const laborByOperator = Array.from(operatorMap.values())
      .sort((a, b) => b.totalCost - a.totalCost);

    const report = {
      metrics: {
        totalCosts,
        materialCosts: materialsCost,
        materialsCost,
        laborCosts: laborCost,
        equipmentCosts: equipmentCost,
        printingCost: equipmentCost * 0.6,
        finishingCost: equipmentCost * 0.4,
        laborCost,
        equipmentCost,
        overheadCost,
        costTrend
      },
      byCategory,
      topMaterials,
      laborByOperator,
      byOrder: [],
      byProduct: [],
      costTrends: []
    };

    return NextResponse.json(report);

  } catch (err) {
    logger.error('API:Reports:Costs', 'Failed to generate costs report', { error: err });
    return NextResponse.json(
      { error: 'Failed to generate costs report' },
      { status: 500 }
    );
  }
}
