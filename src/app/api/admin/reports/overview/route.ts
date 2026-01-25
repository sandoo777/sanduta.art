// GET /api/admin/reports/overview
// Returns global KPIs for dashboard

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthRange, getCachedData, setCachedData } from "@/modules/reports/utils";
import type { OverviewKPIs } from "@/modules/reports/types";
import { subMonths } from "date-fns";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ─────────────────────────────────────────────────────────
    // AUTH CHECK: Only ADMIN and MANAGER can access
    // ─────────────────────────────────────────────────────────
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // ─────────────────────────────────────────────────────────
    // CHECK CACHE (5 minutes TTL)
    // ─────────────────────────────────────────────────────────
    const cacheKey = "reports:overview";
    const cached = getCachedData<OverviewKPIs>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ─────────────────────────────────────────────────────────
    // AGGREGATIONS
    // ─────────────────────────────────────────────────────────

    const currentMonthRange = getCurrentMonthRange();
    const currentMonthStart = currentMonthRange.start;
    const currentMonthEnd = currentMonthRange.end;

    // 1) Total Revenue (all time)
    const revenueAgg = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
    });
    const totalRevenue = Number(revenueAgg._sum.totalPrice || 0);

    // 2) Total Orders (all time)
    const totalOrders = await prisma.order.count();

    // 3) Total Customers
    const totalCustomers = await prisma.customer.count();

    // 4) Total Products
    const totalProducts = await prisma.product.count();

    // 5) Orders This Month
    const ordersThisMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: currentMonthRange.start,
          lte: currentMonthRange.end,
        },
      },
    });

    // 6) Revenue This Month
    const revenueThisMonthAgg = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: currentMonthRange.start,
          lte: currentMonthRange.end,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });
    const revenueThisMonth = Number(revenueThisMonthAgg._sum.totalPrice || 0);

    // 7) Average Order Value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 8) Top Product (most ordered)
    const topProductData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
      take: 1,
    });

    let topProduct = null;
    if (topProductData.length > 0) {
      const productId = topProductData[0].productId;
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true },
      });

      if (product) {
        topProduct = {
          id: product.id,
          name: product.name,
          sales: topProductData[0]._count.productId,
        };
      }
    }

    // 9) Top Customer (highest total spent)
    const topCustomerData = await prisma.order.groupBy({
      by: ["customerId"],
      where: {
        customerId: { not: null },
      },
      _sum: {
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: "desc",
        },
      },
      take: 1,
    });

    let topCustomer = null;
    if (topCustomerData.length > 0 && topCustomerData[0].customerId) {
      const customerId = topCustomerData[0].customerId;
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, name: true, email: true },
      });

      if (customer) {
        topCustomer = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          totalSpent: Number(topCustomerData[0]._sum.totalPrice || 0),
        };
      }
    }

    // ─────────────────────────────────────────────────────────
    // GROWTH CALCULATIONS
    // ─────────────────────────────────────────────────────────
    const previousMonthStart = subMonths(currentMonthStart, 1);
    const previousMonthEnd = subMonths(currentMonthEnd, 1);

    const previousMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lt: previousMonthEnd,
        },
      },
    });

    const previousMonthRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lt: previousMonthEnd,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const prevRevenue = Number(previousMonthRevenue._sum.totalPrice || 0);
    const monthlyGrowth = prevRevenue > 0 
      ? ((revenueThisMonth - prevRevenue) / prevRevenue) * 100 
      : 0;
    const ordersGrowth = previousMonthOrders > 0 
      ? ((ordersThisMonth - previousMonthOrders) / previousMonthOrders) * 100 
      : 0;

    // ─────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────

    const result: OverviewKPIs = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      avgOrderValue,
      monthlyRevenue: revenueThisMonth,
      monthlyOrders: ordersThisMonth,
      monthlyGrowth,
      ordersGrowth,
      topSellingProduct: topProduct,
    };

    // Cache result for 5 minutes
    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching overview report:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview report" },
      { status: 500 }
    );
  }
}
