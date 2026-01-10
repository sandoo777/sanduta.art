import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics/kpis
 * Obține KPI-urile principale pentru dashboard
 */
export async function GET(req: NextRequest) {
  try {
    // Verificare rol
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER"]);
    if (authError) return authError;

    logger.info("API:Analytics:KPIs", "Fetching KPIs", { userId: user.id });

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);

    // Sales today
    const salesToday = await prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfToday },
      },
      _sum: { totalPrice: true },
    });

    const salesYesterday = await prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: startOfYesterday,
          lt: endOfYesterday,
        },
      },
      _sum: { totalPrice: true },
    });

    const salesTodayValue = Number(salesToday._sum.totalPrice || 0);
    const salesYesterdayValue = Number(salesYesterday._sum.totalPrice || 0);
    const salesChange =
      salesYesterdayValue > 0
        ? ((salesTodayValue - salesYesterdayValue) / salesYesterdayValue) * 100
        : 0;

    // Orders today
    const ordersToday = await prisma.order.count({
      where: { createdAt: { gte: startOfToday } },
    });

    const ordersYesterday = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lt: endOfYesterday,
        },
      },
    });

    const ordersChange =
      ordersYesterday > 0
        ? ((ordersToday - ordersYesterday) / ordersYesterday) * 100
        : 0;

    // In production
    const inProduction = await prisma.order.count({
      where: { status: "IN_PRODUCTION" },
    });

    const inProductionYesterday = await prisma.order.count({
      where: {
        status: "IN_PRODUCTION",
        updatedAt: {
          gte: startOfYesterday,
          lt: endOfYesterday,
        },
      },
    });

    const productionChange =
      inProductionYesterday > 0
        ? ((inProduction - inProductionYesterday) / inProductionYesterday) * 100
        : 0;

    // Estimated profit (30% margin estimate)
    const estimatedProfit = salesTodayValue * 0.3;
    const estimatedProfitYesterday = salesYesterdayValue * 0.3;
    const profitChange =
      estimatedProfitYesterday > 0
        ? ((estimatedProfit - estimatedProfitYesterday) / estimatedProfitYesterday) * 100
        : 0;

    // Avg production time (din completedAt - startedAt)
    const completedOrders = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        updatedAt: { gte: startOfToday },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const avgProductionTime =
      completedOrders.length > 0
        ? completedOrders.reduce((acc, order) => {
            return (
              acc +
              (order.updatedAt.getTime() - order.createdAt.getTime()) / 1000 / 3600
            );
          }, 0) / completedOrders.length
        : 0;

    // On-time delivery rate
    const totalDelivered = await prisma.order.count({
      where: {
        status: "DELIVERED",
        updatedAt: { gte: startOfToday },
      },
    });

    const onTimeDelivered = await prisma.order.count({
      where: {
        status: "DELIVERED",
        updatedAt: { gte: startOfToday },
      },
    });

    const onTimeRate = totalDelivered > 0 ? (onTimeDelivered / totalDelivered) * 100 : 100;

    // Equipment utilization (mock - trebuie integrat cu sistemul real)
    const equipmentUtilization = 85; // Mock value

    const kpis = {
      salesToday: salesTodayValue,
      salesChange,
      ordersToday,
      ordersChange,
      inProduction,
      productionChange,
      estimatedProfit,
      profitChange,
      avgProductionTime,
      timeChange: -5, // Mock
      onTimeRate,
      onTimeChange: 2, // Mock
      equipmentUtilization,
      utilizationChange: 3, // Mock
    };

    logger.info("API:Analytics:KPIs", "KPIs fetched successfully", {
      userId: user.id,
      salesToday: salesTodayValue,
      ordersToday,
    });

    return NextResponse.json(kpis);
  } catch (err) {
    logApiError("API:Analytics:KPIs", err);
    return createErrorResponse("Failed to fetch KPIs", 500);
  }
}
