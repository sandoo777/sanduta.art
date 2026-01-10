import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics/sales
 * Obține date de vânzări pentru grafice
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER"]);
    if (authError) return authError;

    const searchParams = req.nextUrl.searchParams;
    const period = (searchParams.get("period") || "week") as "day" | "week" | "month" | "year";
    const compare = searchParams.get("compare") === "true";

    logger.info("API:Analytics:Sales", "Fetching sales data", {
      userId: user.id,
      period,
      compare,
    });

    const now = new Date();
    let startDate: Date;
    let compareStartDate: Date | undefined;
    let groupBy: "hour" | "day" | "week" | "month";

    switch (period) {
      case "day":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        compareStartDate = new Date(startDate);
        compareStartDate.setDate(compareStartDate.getDate() - 1);
        groupBy = "hour";
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        compareStartDate = new Date(startDate);
        compareStartDate.setDate(compareStartDate.getDate() - 7);
        groupBy = "day";
        break;
      case "month":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        compareStartDate = new Date(startDate);
        compareStartDate.setDate(compareStartDate.getDate() - 30);
        groupBy = "day";
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        compareStartDate = new Date(startDate);
        compareStartDate.setFullYear(compareStartDate.getFullYear() - 1);
        groupBy = "month";
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        groupBy = "day";
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startDate },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    let compareOrders: { totalPrice: any; createdAt: Date }[] = [];
    if (compare && compareStartDate) {
      compareOrders = await prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: compareStartDate,
            lt: startDate,
          },
        },
        select: {
          totalPrice: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }

    // Group data
    const groupedData = new Map<string, number>();
    const compareGroupedData = new Map<string, number>();

    orders.forEach((order) => {
      const key = formatDate(order.createdAt, groupBy);
      groupedData.set(key, (groupedData.get(key) || 0) + Number(order.totalPrice));
    });

    if (compare) {
      compareOrders.forEach((order) => {
        const key = formatDate(order.createdAt, groupBy);
        compareGroupedData.set(key, (compareGroupedData.get(key) || 0) + Number(order.totalPrice));
      });
    }

    // Convert to array
    const dataPoints = Array.from(groupedData.entries())
      .map(([date, value]) => ({
        date,
        value,
        compareValue: compare ? compareGroupedData.get(date) || 0 : undefined,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    logger.info("API:Analytics:Sales", "Sales data fetched successfully", {
      userId: user.id,
      dataPoints: dataPoints.length,
    });

    return NextResponse.json(dataPoints);
  } catch (err) {
    logApiError("API:Analytics:Sales", err);
    return createErrorResponse("Failed to fetch sales data", 500);
  }
}

function formatDate(date: Date, groupBy: "hour" | "day" | "week" | "month"): string {
  const d = new Date(date);
  switch (groupBy) {
    case "hour":
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`;
    case "day":
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    case "week":
      return `${d.getFullYear()}-W${getWeekNumber(d)}`;
    case "month":
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    default:
      return d.toISOString().split("T")[0];
  }
}

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
