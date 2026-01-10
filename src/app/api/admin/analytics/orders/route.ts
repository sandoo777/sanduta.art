import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics/orders
 * Obține statistici despre comenzi
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER"]);
    if (authError) return authError;

    logger.info("API:Analytics:Orders", "Fetching orders stats", { userId: user.id });

    // Număr comenzi per status
    const statuses: Array<"PENDING" | "IN_PREPRODUCTION" | "IN_DESIGN" | "IN_PRODUCTION" | "IN_PRINTING" | "QUALITY_CHECK" | "READY_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"> = [
      "PENDING",
      "IN_PREPRODUCTION",
      "IN_DESIGN",
      "IN_PRODUCTION",
      "IN_PRINTING",
      "QUALITY_CHECK",
      "READY_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];
    const orderCounts = await Promise.all(
      statuses.map(async (status) => {
        const count = await prisma.order.count({ where: { status } });
        return { status, count };
      })
    );

    const total = orderCounts.reduce((sum, s) => sum + s.count, 0);

    const stats = orderCounts.map((s) => ({
      status: s.status,
      count: s.count,
      percentage: total > 0 ? (s.count / total) * 100 : 0,
    }));

    logger.info("API:Analytics:Orders", "Orders stats fetched successfully", {
      userId: user.id,
      total,
    });

    return NextResponse.json(stats);
  } catch (err) {
    logApiError("API:Analytics:Orders", err);
    return createErrorResponse("Failed to fetch orders stats", 500);
  }
}
