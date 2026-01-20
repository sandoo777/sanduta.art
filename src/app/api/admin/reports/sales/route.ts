// GET /api/admin/reports/sales
// Returns sales analytics by month, day, source, channel, status

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { 
  getLastNMonthsRange, 
  getLastNDaysRange, 
  getMonthLabels, 
  getDayLabels,
  getCachedData,
  setCachedData
} from "@/modules/reports/utils";
import { format } from "date-fns";
import type { 
  SalesReport, 
  MonthlyRevenue, 
  DailyRevenue, 
  SalesBySource, 
  SalesByChannel, 
  SalesByStatus 
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
    const cacheKey = "reports:sales";
    const cached = getCachedData<SalesReport>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ─────────────────────────────────────────────────────────
    // 1. SALES BY MONTH (last 12 months)
    // ─────────────────────────────────────────────────────────
    const monthRange = getLastNMonthsRange(12);
    const monthLabels = getMonthLabels(12);

    const ordersByMonth = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: monthRange.start,
          lte: monthRange.end,
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { revenue: number; count: number }> = {};
    monthLabels.forEach(month => {
      monthlyData[month] = { revenue: 0, count: 0 };
    });

    ordersByMonth.forEach(order => {
      const month = format(order.createdAt, "yyyy-MM");
      if (monthlyData[month]) {
        monthlyData[month].revenue += Number(order.totalPrice);
        monthlyData[month].count += 1;
      }
    });

    const salesByMonth: MonthlyRevenue[] = monthLabels.map(month => ({
      month,
      revenue: monthlyData[month].revenue,
      orders: monthlyData[month].count,
      avgOrderValue: monthlyData[month].count > 0 ? monthlyData[month].revenue / monthlyData[month].count : 0,
    }));

    // ─────────────────────────────────────────────────────────
    // 2. SALES BY DAY (last 30 days)
    // ─────────────────────────────────────────────────────────
    const dayRange = getLastNDaysRange(30);
    const dayLabels = getDayLabels(30);

    const ordersByDay = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dayRange.start,
          lte: dayRange.end,
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
    });

    // Group by day
    const dailyData: Record<string, { revenue: number; count: number }> = {};
    dayLabels.forEach(day => {
      dailyData[day] = { revenue: 0, count: 0 };
    });

    ordersByDay.forEach(order => {
      const day = format(order.createdAt, "yyyy-MM-dd");
      if (dailyData[day]) {
        dailyData[day].revenue += Number(order.totalPrice);
        dailyData[day].count += 1;
      }
    });

    const salesByDay: DailyRevenue[] = dayLabels.map(day => ({
      date: day,
      revenue: dailyData[day].revenue,
      orders: dailyData[day].count,
    }));

    // ─────────────────────────────────────────────────────────
    // 3. SALES BY SOURCE (ONLINE/OFFLINE)
    // ─────────────────────────────────────────────────────────
    const ordersBySource = await prisma.order.groupBy({
      by: ["source"],
      _sum: {
        totalPrice: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenueAllOrders = ordersBySource.reduce((sum, g) => sum + Number(g._sum.totalPrice || 0), 0);
    const salesBySource: SalesBySource[] = ordersBySource.map(group => {
      const revenue = Number(group._sum.totalPrice || 0);
      return {
        source: group.source,
        revenue,
        orders: group._count.id,
        percentage: totalRevenueAllOrders > 0 ? (revenue / totalRevenueAllOrders) * 100 : 0,
      };
    });

    // ─────────────────────────────────────────────────────────
    // 4. SALES BY CHANNEL (WEB/PHONE/WALK_IN/EMAIL)
    // ─────────────────────────────────────────────────────────
    const ordersByChannel = await prisma.order.groupBy({
      by: ["channel"],
      _sum: {
        totalPrice: true,
      },
      _count: {
        id: true,
      },
    });

    const salesByChannel: SalesByChannel[] = ordersByChannel.map(group => {
      const revenue = Number(group._sum.totalPrice || 0);
      return {
        channel: group.channel,
        revenue,
        orders: group._count.id,
        percentage: totalRevenueAllOrders > 0 ? (revenue / totalRevenueAllOrders) * 100 : 0,
      };
    });

    // ─────────────────────────────────────────────────────────
    // 5. SALES BY STATUS
    // ─────────────────────────────────────────────────────────
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const totalOrders = ordersByStatus.reduce((sum, g) => sum + g._count.id, 0);
    const salesByStatus: SalesByStatus[] = ordersByStatus.map(group => ({
      status: group.status,
      count: group._count.id,
      percentage: totalOrders > 0 ? (group._count.id / totalOrders) * 100 : 0,
    }));

    // ─────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────
    const result: SalesReport = {
      salesByMonth,
      salesByDay,
      salesBySource,
      salesByChannel,
      salesByStatus,
      totalRevenue: totalRevenueAllOrders,
      totalOrders,
    };

    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales report" },
      { status: 500 }
    );
  }
}
