import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/admin/analytics/machines
 * Obține utilizarea echipamentelor din baza de date
 */
export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER", "OPERATOR"]);
    if (authError) return authError;

    logger.info("API:Analytics:Machines", "Fetching machines utilization", {
      userId: user.id,
    });

    const dbMachines = await prisma.machine.findMany({
      where: { active: true },
      include: {
        productionJobs: {
          where: {
            startedAt: { not: null },
            completedAt: {
              gte: new Date(Date.now() - 8 * 60 * 60 * 1000), // ultimele 8 ore
            },
          },
          select: { startedAt: true, completedAt: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const machines = dbMachines.map((m) => {
      let activeMs = 0;
      for (const job of m.productionJobs) {
        if (job.startedAt && job.completedAt) {
          activeMs += job.completedAt.getTime() - job.startedAt.getTime();
        }
      }
      const activeTime = Math.min(activeMs / (1000 * 60 * 60), 8);
      const idleTime = Math.max(8 - activeTime, 0);
      const utilization = Math.round((activeTime / 8) * 100);

      let status: "active" | "idle" | "maintenance";
      if (m.status === "MAINTENANCE") status = "maintenance";
      else if (m.status === "BUSY") status = "active";
      else status = utilization > 0 ? "active" : "idle";

      return {
        id: m.id,
        name: m.name,
        type: m.type,
        status,
        utilization,
        activeTime: Math.round(activeTime * 10) / 10,
        idleTime: Math.round(idleTime * 10) / 10,
      };
    });

    logger.info("API:Analytics:Machines", "Machines utilization fetched", {
      userId: user.id,
      count: machines.length,
    });

    return NextResponse.json(machines);
  } catch (err) {
    logApiError("API:Analytics:Machines", err);
    return createErrorResponse("Failed to fetch machines utilization", 500);
  }
}
