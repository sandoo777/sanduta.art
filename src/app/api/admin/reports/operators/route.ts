// GET /api/admin/reports/operators
// Returns operator analytics: jobs completed, avg completion time, efficiency

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { ProductionStatus } from "@prisma/client";
import { 
  calculateCompletionTimeHours,
  calculateAverage,
  getCachedData,
  setCachedData
} from "@/modules/reports/utils";
import type { 
  OperatorsReport, 
  OperatorJobs, 
  OperatorEfficiency, 
  CompletionTimes 
} from "@/modules/reports/types";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ─────────────────────────────────────────────────────────
    // AUTH CHECK
    // ─────────────────────────────────────────────────────────
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // ─────────────────────────────────────────────────────────
    // CHECK CACHE
    // ─────────────────────────────────────────────────────────
    const cacheKey = "reports:operators";
    const cached = getCachedData<OperatorsReport>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ─────────────────────────────────────────────────────────
    // 1. JOBS BY OPERATOR (completed + in progress)
    // ─────────────────────────────────────────────────────────
    const operatorJobsData = await prisma.productionJob.groupBy({
      by: ["assignedToId", "status"],
      where: {
        assignedToId: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // Get operator info
    const operatorIds = Array.from(
      new Set(
        operatorJobsData
          .map(item => item.assignedToId)
          .filter((id): id is string => id !== null)
      )
    );

    const operators = await prisma.user.findMany({
      where: {
        id: { in: operatorIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Group by operator
    const operatorJobsMap: Record<string, { completed: number; inProgress: number; completionTimes: number[] }> = {};
    
    const completedJobsWithTimes = await prisma.productionJob.findMany({
      where: {
        assignedToId: { not: null },
        status: ProductionStatus.COMPLETED,
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        assignedToId: true,
        startedAt: true,
        completedAt: true,
      },
    });

    operatorJobsData.forEach(item => {
      if (!item.assignedToId) return;

      if (!operatorJobsMap[item.assignedToId]) {
        operatorJobsMap[item.assignedToId] = {
          completed: 0,
          inProgress: 0,
          completionTimes: [],
        };
      }

      const count = item._count.id;

      if (item.status === ProductionStatus.COMPLETED) {
        operatorJobsMap[item.assignedToId].completed += count;
      } else if (item.status === ProductionStatus.IN_PROGRESS) {
        operatorJobsMap[item.assignedToId].inProgress += count;
      }
    });

    // Add completion times per operator
    completedJobsWithTimes.forEach(job => {
      if (!job.assignedToId) return;
      const hours = calculateCompletionTimeHours(job.startedAt, job.completedAt);
      if (hours !== null && operatorJobsMap[job.assignedToId]) {
        operatorJobsMap[job.assignedToId].completionTimes.push(hours);
      }
    });

    const operatorJobs: OperatorJobs[] = Object.entries(operatorJobsMap).map(([operatorId, stats]) => {
      const operator = operators.find(op => op.id === operatorId);
      const avgTime = calculateAverage(stats.completionTimes);
      
      return {
        operatorId,
        operatorName: operator?.name || "Unknown",
        operatorEmail: operator?.email || "",
        jobsCompleted: stats.completed,
        jobsInProgress: stats.inProgress,
        avgCompletionTime: avgTime,
      };
    });

    // ─────────────────────────────────────────────────────────
    // 2. AVERAGE COMPLETION TIME (hours)
    // ─────────────────────────────────────────────────────────
    const completedJobs = await prisma.productionJob.findMany({
      where: {
        status: ProductionStatus.COMPLETED,
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const completionTimes: number[] = [];
    completedJobs.forEach(job => {
      const hours = calculateCompletionTimeHours(job.startedAt, job.completedAt);
      if (hours !== null) {
        completionTimes.push(hours);
      }
    });

    const avgCompletionTime = calculateAverage(completionTimes);

    // ─────────────────────────────────────────────────────────
    // 2.5. COMPLETION TIMES BY OPERATOR
    // ─────────────────────────────────────────────────────────
    const completionTimesByOperator: CompletionTimes[] = Object.entries(operatorJobsMap)
      .filter(([_, stats]) => stats.completionTimes.length > 0)
      .map(([operatorId, stats]) => {
        const operator = operators.find(op => op.id === operatorId);
        const times = stats.completionTimes;
        return {
          operatorId,
          operatorName: operator?.name || "Unknown",
          completionTimes: times,
          avgTime: calculateAverage(times),
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
        };
      });

    // ─────────────────────────────────────────────────────────
    // 3. JOBS IN PROGRESS (total count)
    // ─────────────────────────────────────────────────────────
    const jobsInProgress = await prisma.productionJob.count({
      where: {
        status: ProductionStatus.IN_PROGRESS,
      },
    });

    // ─────────────────────────────────────────────────────────
    // 4. OPERATOR EFFICIENCY SCORE
    // ─────────────────────────────────────────────────────────
    // Efficiency formula:
    // - Base score: completed jobs count
    // - Penalty: longer completion times reduce score
    // - Scale to 0-100

    const operatorEfficiencyData = await prisma.productionJob.findMany({
      where: {
        assignedToId: { not: null },
        status: ProductionStatus.COMPLETED,
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        assignedToId: true,
        startedAt: true,
        completedAt: true,
      },
    });

    // Group by operator
    const operatorTimeMap: Record<string, number[]> = {};
    operatorEfficiencyData.forEach(job => {
      if (!job.assignedToId) return;

      if (!operatorTimeMap[job.assignedToId]) {
        operatorTimeMap[job.assignedToId] = [];
      }

      const hours = calculateCompletionTimeHours(job.startedAt, job.completedAt);
      if (hours !== null) {
        operatorTimeMap[job.assignedToId].push(hours);
      }
    });

    const operatorEfficiency: OperatorEfficiency[] = Object.entries(operatorTimeMap).map(([operatorId, times]) => {
      const operator = operators.find(op => op.id === operatorId);
      const jobsCompleted = times.length;
      const avgTime = calculateAverage(times);

      // Define "on time" as jobs completed in <= average completion time
      const onTimeJobs = times.filter(t => t <= avgCompletionTime).length;
      const lateJobs = times.filter(t => t > avgCompletionTime).length;

      // Efficiency score calculation:
      // Base: number of completed jobs (max 50 points)
      // Speed: inversely proportional to avg time (max 50 points)
      const baseScore = Math.min(jobsCompleted * 2, 50);
      
      // If avg completion time is below global average, give bonus
      // If above, give penalty
      let speedScore = 50;
      if (avgCompletionTime > 0) {
        const ratio = avgCompletionTime / avgTime;
        speedScore = Math.min(Math.max(ratio * 50, 0), 50);
      }

      const efficiencyScore = Math.round(baseScore + speedScore);

      return {
        operatorId,
        operatorName: operator?.name || "Unknown",
        efficiencyScore,
        jobsCompleted,
        avgCompletionTime: avgTime,
        onTimeJobs,
        lateJobs,
      };
    }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    // ─────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────
    const totalJobsCount = await prisma.productionJob.count();
    const totalCompletedJobsCount = await prisma.productionJob.count({
      where: { status: ProductionStatus.COMPLETED },
    });

    const result: OperatorsReport = {
      operatorJobs,
      completionTimesByOperator,
      operatorEfficiency,
      totalJobs: totalJobsCount,
      totalCompletedJobs: totalCompletedJobsCount,
      avgCompletionTimeAllOperators: avgCompletionTime,
    };

    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching operators report:", error);
    return NextResponse.json(
      { error: "Failed to fetch operators report" },
      { status: 500 }
    );
  }
}
