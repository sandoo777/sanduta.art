import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics/operators
 * Obține performanța operatorilor
 */
export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER"]);
    if (authError) return authError;

    logger.info("API:Analytics:Operators", "Fetching operator performance", {
      userId: user.id,
    });

    // Obține operatorii (users cu rol OPERATOR)
    const operators = await prisma.user.findMany({
      where: { role: "OPERATOR" },
      select: {
        id: true,
        name: true,
      },
    });

    // Mock data pentru performanță - va fi înlocuit cu date reale
    // În viitor, datele vor veni din tabela ProductionLog sau similar
    const performance = operators.map((operator, index) => {
      // Generăm date mock bazate pe index
      const jobsCompleted = 120 - index * 10;
      const avgTime = 2.5 + index * 0.3;
      const accuracy = 95 - index * 2;
      const errors = index + 1;
      const kpiScore = Math.round(
        (jobsCompleted / 1.5 + accuracy + (1 / (avgTime / 2)) * 30) / 3
      );

      return {
        id: operator.id,
        name: operator.name || "Operator Necunoscut",
        jobsCompleted,
        avgTime: Math.round(avgTime * 10) / 10,
        accuracy,
        errors,
        kpiScore,
      };
    });

    // Sortează după KPI score
    performance.sort((a, b) => b.kpiScore - a.kpiScore);

    // Returnează top 10
    const topPerformers = performance.slice(0, 10);

    logger.info("API:Analytics:Operators", "Operator performance fetched successfully", {
      userId: user.id,
      count: topPerformers.length,
    });

    return NextResponse.json(topPerformers);
  } catch (err) {
    logApiError("API:Analytics:Operators", err);
    return createErrorResponse("Failed to fetch operator performance", 500);
  }
}
