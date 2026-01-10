import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics/recent-orders
 * Obține ultimele comenzi
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER"]);
    if (authError) return authError;

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    logger.info("API:Analytics:RecentOrders", "Fetching recent orders", {
      userId: user.id,
      limit,
    });

    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        totalPrice: true,
        status: true,
        createdAt: true,
      },
    });

    logger.info("API:Analytics:RecentOrders", "Recent orders fetched successfully", {
      userId: user.id,
      count: orders.length,
    });

    return NextResponse.json(orders);
  } catch (err) {
    logApiError("API:Analytics:RecentOrders", err);
    return createErrorResponse("Failed to fetch recent orders", 500);
  }
}
