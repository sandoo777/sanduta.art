// GET /api/admin/reports/products
// Returns product analytics: top selling, by category, revenue, performance

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData } from "@/modules/reports/utils";
import type { ProductsReport, TopProduct, CategoryRevenue, ProductRevenue, ProductPerformance } from "@/modules/reports/types";

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
    const cacheKey = "reports:products";
    const cached = getCachedData<ProductsReport>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ─────────────────────────────────────────────────────────
    // 1. TOP SELLING PRODUCTS (by quantity)
    // ─────────────────────────────────────────────────────────
    const topSellingData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        lineTotal: true,
      },
      _count: {
        orderId: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const topProductIds = topSellingData.map(item => item.productId);
    const topProducts = await prisma.product.findMany({
      where: {
        id: { in: topProductIds },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    const topSellingProducts: TopProduct[] = topSellingData.map(item => {
      const product = topProducts.find(p => p.id === item.productId);
      const revenue = Number(item._sum.lineTotal || 0);
      const quantity = item._sum.quantity || 0;
      return {
        id: item.productId,
        name: product?.name || "Unknown",
        sku: "N/A",
        quantity,
        revenue,
        avgPrice: quantity > 0 ? revenue / quantity : 0,
      };
    });

    // ─────────────────────────────────────────────────────────
    // 2. PRODUCTS BY CATEGORY
    // ─────────────────────────────────────────────────────────
    const productsByCategory = await prisma.product.groupBy({
      by: ["categoryId"],
      _count: {
        id: true,
      },
    });

    const categoryIds = productsByCategory.map(item => item.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Calculate revenue per category
    const categoryRevenueData = await prisma.orderItem.findMany({
      select: {
        lineTotal: true,
        quantity: true,
        product: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    const categoryRevenueMap: Record<string, number> = {};
    const categoryQuantityMap: Record<string, number> = {};
    categoryRevenueData.forEach(item => {
      const catId = item.product.categoryId;
      if (!categoryRevenueMap[catId]) {
        categoryRevenueMap[catId] = 0;
        categoryQuantityMap[catId] = 0;
      }
      categoryRevenueMap[catId] += Number(item.lineTotal);
      categoryQuantityMap[catId] += item.quantity;
    });

    const productsByCategoryResult: CategoryRevenue[] = productsByCategory.map(item => {
      const category = categories.find(c => c.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || "Unknown",
        revenue: categoryRevenueMap[item.categoryId] || 0,
        productsCount: item._count.id,
        totalQuantity: categoryQuantityMap[item.categoryId] || 0,
      };
    });

    // ─────────────────────────────────────────────────────────
    // 3. REVENUE BY PRODUCT
    // ─────────────────────────────────────────────────────────
    const revenueByProductData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        lineTotal: true,
        quantity: true,
      },
      orderBy: {
        _sum: {
          lineTotal: "desc",
        },
      },
      take: 20,
    });

    const revenueProductIds = revenueByProductData.map(item => item.productId);
    const revenueProducts = await prisma.product.findMany({
      where: {
        id: { in: revenueProductIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const totalRevProducts = revenueByProductData.reduce((sum, item) => sum + Number(item._sum.lineTotal || 0), 0);
    const revenueByProduct: ProductRevenue[] = revenueByProductData.map(item => {
      const product = revenueProducts.find(p => p.id === item.productId);
      const revenue = Number(item._sum.lineTotal || 0);
      const quantity = item._sum.quantity || 0;
      return {
        id: item.productId,
        name: product?.name || "Unknown",
        revenue,
        quantity,
        percentage: totalRevProducts > 0 ? (revenue / totalRevProducts) * 100 : 0,
      };
    });

    // ─────────────────────────────────────────────────────────
    // 4. PRODUCT PERFORMANCE (orders, revenue, avgPrice)
    // ─────────────────────────────────────────────────────────
    const performanceData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _count: {
        orderId: true,
      },
      _sum: {
        lineTotal: true,
        quantity: true,
      },
    });

    const performanceProductIds = performanceData.map(item => item.productId);
    const performanceProducts = await prisma.product.findMany({
      where: {
        id: { in: performanceProductIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const productPerformance: ProductPerformance[] = performanceData.map(item => {
      const product = performanceProducts.find(p => p.id === item.productId);
      const totalRevenue = Number(item._sum.lineTotal || 0);
      const totalQuantity = item._sum.quantity || 0;
      const ordersCount = item._count.orderId;
      const avgOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

      return {
        id: item.productId,
        name: product?.name || "Unknown",
        totalRevenue,
        totalQuantity,
        avgOrderValue,
        ordersCount,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 20);

    // ─────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────
    const totalProductsCount = await prisma.product.count();
    const totalRevenueAll = revenueByProductData.reduce((sum, item) => sum + Number(item._sum.lineTotal || 0), 0);

    const result: ProductsReport = {
      topSellingProducts,
      productsByCategory: productsByCategoryResult,
      revenueByProduct,
      productPerformance,
      totalProducts: totalProductsCount,
      totalRevenue: totalRevenueAll,
    };

    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (_error) {
    console.error("Error fetching products report:", error);
    return NextResponse.json(
      { error: "Failed to fetch products report" },
      { status: 500 }
    );
  }
}
