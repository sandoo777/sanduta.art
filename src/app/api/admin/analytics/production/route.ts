import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics/production
 * Obține statistici de producție
 */
export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER"]);
    if (authError) return authError;

    logger.info("API:Analytics:Production", "Fetching production stats", {
      userId: user.id,
    });

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Active orders in production
    const active = await prisma.order.count({
      where: { status: "IN_PRODUCTION" },
    });

    // Delayed orders (estimatedDeliveryDate < now și status != DELIVERED)
    const delayed = await prisma.order.count({
      where: {
        status: { notIn: ["DELIVERED", "CANCELLED"] },
        // estimatedDeliveryDate: { lt: now }, // Uncomment when field exists
      },
    });

    // Completed today
    const completedToday = await prisma.order.count({
      where: {
        status: "DELIVERED",
        updatedAt: { gte: startOfToday },
      },
    });

    // Queued (pending sau IN_PREPRODUCTION)
    const queued = await prisma.order.count({
      where: {
        status: { in: ["PENDING", "IN_PREPRODUCTION"] },
      },
    });

    // Throughput - last 7 days
    const throughput = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.order.count({
        where: {
          status: "DELIVERED",
          updatedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      throughput.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    const stats = {
      active,
      delayed,
      completedToday,
      queued,
      throughput,
    };

    logger.info("API:Analytics:Production", "Production stats fetched successfully", {
      userId: user.id,
      active,
      completedToday,
    });

    return NextResponse.json(stats);
  } catch (err) {
    logApiError("API:Analytics:Production", err);
    return createErrorResponse("Failed to fetch production stats", 500);
  }
}
