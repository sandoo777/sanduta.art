// GET /api/admin/reports/customers
// Returns customer analytics: top customers, new customers, CLV, segments

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { 
  getLastNMonthsRange, 
  getMonthLabels, 
  calculateMedian,
  getCachedData,
  setCachedData
} from "@/modules/reports/utils";
import { format } from "date-fns";
import type { CustomersReport, TopCustomer, MonthlyCustomers } from "@/modules/reports/types";

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
    const cacheKey = "reports:customers";
    const cached = getCachedData<CustomersReport>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ─────────────────────────────────────────────────────────
    // 1. TOP CUSTOMERS (by total spent)
    // ─────────────────────────────────────────────────────────
    const topCustomersData = await prisma.order.groupBy({
      by: ["customerId"],
      where: {
        customerId: { not: null },
      },
      _sum: {
        totalPrice: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalPrice: "desc",
        },
      },
      take: 10,
    });

    const topCustomerIds = topCustomersData
      .map(item => item.customerId)
      .filter((id): id is string => id !== null);

    const topCustomersInfo = await prisma.customer.findMany({
      where: {
        id: { in: topCustomerIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    // Get orders for avg and last order date
    const topCustomersOrders = await prisma.order.findMany({
      where: {
        customerId: { in: topCustomerIds },
      },
      select: {
        customerId: true,
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const topCustomers: TopCustomer[] = topCustomersData
      .filter(item => item.customerId !== null)
      .map(item => {
        const customer = topCustomersInfo.find(c => c.id === item.customerId);
        const totalSpent = Number(item._sum.totalPrice || 0);
        const totalOrders = item._count.id;
        const customerOrders = topCustomersOrders.filter(o => o.customerId === item.customerId);
        const lastOrder = customerOrders[0];
        
        return {
          id: item.customerId!,
          name: customer?.name || "Unknown",
          email: customer?.email || "",
          phone: customer?.phone || null,
          totalSpent,
          totalOrders,
          avgOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
          lastOrderDate: lastOrder ? lastOrder.createdAt.toISOString() : new Date().toISOString(),
        };
      });

    // ─────────────────────────────────────────────────────────
    // 2. NEW CUSTOMERS BY MONTH (last 12 months)
    // ─────────────────────────────────────────────────────────
    const monthRange = getLastNMonthsRange(12);
    const monthLabels = getMonthLabels(12);

    const newCustomers = await prisma.customer.findMany({
      where: {
        createdAt: {
          gte: monthRange.start,
          lte: monthRange.end,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by month
    const monthlyCustomersData: Record<string, number> = {};
    monthLabels.forEach(month => {
      monthlyCustomersData[month] = 0;
    });

    newCustomers.forEach(customer => {
      const month = format(customer.createdAt, "yyyy-MM");
      if (monthlyCustomersData[month] !== undefined) {
        monthlyCustomersData[month] += 1;
      }
    });

    const newCustomersByMonth: MonthlyCustomers[] = monthLabels.map(month => ({
      month,
      count: monthlyCustomersData[month],
    }));

    // ─────────────────────────────────────────────────────────
    // 3. RETURNING CUSTOMERS COUNT (customers with 2+ orders)
    // ─────────────────────────────────────────────────────────
    const customerOrderCounts = await prisma.order.groupBy({
      by: ["customerId"],
      where: {
        customerId: { not: null },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gte: 2,
          },
        },
      },
    });

    const returningCustomersCount = customerOrderCounts.length;

    // ─────────────────────────────────────────────────────────
    // 4. CUSTOMER LIFETIME VALUE (CLV)
    // ─────────────────────────────────────────────────────────
    const allCustomerSpending = await prisma.order.groupBy({
      by: ["customerId"],
      where: {
        customerId: { not: null },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const clvValues = allCustomerSpending.map(item => Number(item._sum.totalPrice || 0));
    
    const totalCLV = clvValues.reduce((sum, val) => sum + val, 0);
    const averageCLV = clvValues.length > 0 ? totalCLV / clvValues.length : 0;
    const medianCLV = calculateMedian(clvValues);

    const customerLifetimeValue = {
      average: averageCLV,
      median: medianCLV,
      total: totalCLV,
    };

    // ─────────────────────────────────────────────────────────
    // 5. CUSTOMER SEGMENTS (high/medium/low value)
    // ─────────────────────────────────────────────────────────
    // Define thresholds based on average CLV
    const highValueThreshold = averageCLV * 2; // 2x average
    const mediumValueThreshold = averageCLV * 0.5; // 0.5x average

    let highValueCount = 0;
    let mediumValueCount = 0;
    let lowValueCount = 0;

    clvValues.forEach(value => {
      if (value >= highValueThreshold) {
        highValueCount++;
      } else if (value >= mediumValueThreshold) {
        mediumValueCount++;
      } else {
        lowValueCount++;
      }
    });

    const customerSegments = {
      high: highValueCount,
      medium: mediumValueCount,
      low: lowValueCount,
    };

    // ─────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────
    const totalCustomersCount = await prisma.customer.count();
    
    const result: CustomersReport = {
      topCustomers,
      newCustomersByMonth,
      returningCustomers: {
        total: returningCustomersCount,
        percentage: totalCustomersCount > 0 ? (returningCustomersCount / totalCustomersCount) * 100 : 0,
      },
      customerLifetimeValue,
      customerSegments,
      totalCustomers: totalCustomersCount,
    };

    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching customers report:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers report" },
      { status: 500 }
    );
  }
}
