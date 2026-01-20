// GET /api/admin/reports/materials
// Returns materials analytics: top consumed, consumption by month, low stock, costs

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { 
  getLastNMonthsRange, 
  getMonthLabels,
  getCachedData,
  setCachedData
} from "@/modules/reports/utils";
import { format } from "date-fns";
import type { MaterialsReport, TopMaterial, MonthlyConsumption, LowStockMaterial } from "@/modules/reports/types";

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
    const cacheKey = "reports:materials";
    const cached = getCachedData<MaterialsReport>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ─────────────────────────────────────────────────────────
    // 1. TOP CONSUMED MATERIALS (by quantity)
    // ─────────────────────────────────────────────────────────
    const topConsumedData = await prisma.materialUsage.groupBy({
      by: ["materialId"],
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const topMaterialIds = topConsumedData.map(item => item.materialId);
    const topMaterials = await prisma.material.findMany({
      where: {
        id: { in: topMaterialIds },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: true,
        costPerUnit: true,
      },
    });

    const topConsumedMaterials: TopMaterial[] = topConsumedData.map(item => {
      const material = topMaterials.find(m => m.id === item.materialId);
      const totalConsumed = item._sum.quantity || 0;
      const costPerUnit = material ? Number(material.costPerUnit) : 0;
      const totalCost = totalConsumed * costPerUnit;

      return {
        id: item.materialId,
        name: material?.name || "Unknown",
        sku: material?.sku || "N/A",
        unit: material?.unit || "pcs",
        totalConsumed,
        totalCost,
        usageCount: item._count.id,
      };
    });

    // ─────────────────────────────────────────────────────────
    // 2. CONSUMPTION BY MONTH (last 12 months)
    // ─────────────────────────────────────────────────────────
    const monthRange = getLastNMonthsRange(12);
    const monthLabels = getMonthLabels(12);

    const consumptionData = await prisma.materialUsage.findMany({
      where: {
        createdAt: {
          gte: monthRange.start,
          lte: monthRange.end,
        },
      },
      select: {
        createdAt: true,
        quantity: true,
        materialId: true,
        material: {
          select: {
            costPerUnit: true,
          },
        },
      },
    });

    // Group by month
    const monthlyConsumptionData: Record<string, { quantity: number; cost: number; materials: Set<string> }> = {};
    monthLabels.forEach(month => {
      monthlyConsumptionData[month] = { quantity: 0, cost: 0, materials: new Set() };
    });

    consumptionData.forEach(usage => {
      const month = format(usage.createdAt, "yyyy-MM");
      if (monthlyConsumptionData[month]) {
        monthlyConsumptionData[month].quantity += usage.quantity;
        monthlyConsumptionData[month].cost += usage.quantity * Number(usage.material.costPerUnit);
        monthlyConsumptionData[month].materials.add(usage.materialId);
      }
    });

    const consumptionByMonth: MonthlyConsumption[] = monthLabels.map(month => ({
      month,
      totalQuantity: monthlyConsumptionData[month].quantity,
      totalCost: monthlyConsumptionData[month].cost,
      materialsUsed: monthlyConsumptionData[month].materials.size,
    }));

    // ─────────────────────────────────────────────────────────
    // 3. MATERIALS LOW STOCK (stock <= minStock)
    // ─────────────────────────────────────────────────────────
    const lowStockMaterialsData = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      sku: string | null;
      stock: number;
      minStock: number;
      costPerUnit: number;
    }>>`
      SELECT id, name, sku, stock, "minStock", "costPerUnit"
      FROM materials
      WHERE stock <= "minStock"
      ORDER BY (stock / NULLIF("minStock", 0)) ASC
    `;

    const lowStockMaterials: LowStockMaterial[] = lowStockMaterialsData.map(material => {
      return {
        id: material.id,
        name: material.name,
        sku: material.sku || "N/A",
        currentStock: material.stock,
        minStock: material.minStock,
        difference: material.minStock - material.stock,
        costPerUnit: Number(material.costPerUnit),
      };
    });

    // ─────────────────────────────────────────────────────────
    // TOTALS & AVERAGES
    // ─────────────────────────────────────────────────────────
    const totalMaterialsCount = await prisma.material.count();
    
    const allConsumption = await prisma.materialUsage.findMany({
      select: {
        quantity: true,
        material: {
          select: {
            costPerUnit: true,
          },
        },
      },
    });

    const totalConsumption = allConsumption.reduce((total, usage) => total + usage.quantity, 0);
    const totalCost = allConsumption.reduce((total, usage) => {
      const cost = usage.quantity * Number(usage.material.costPerUnit);
      return total + cost;
    }, 0);

    // Average consumption per production job
    const totalProductionJobs = await prisma.productionJob.count();
    const avgConsumptionPerJob = totalProductionJobs > 0 ? totalConsumption / totalProductionJobs : 0;

    // ─────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────
    const result: MaterialsReport = {
      topConsumedMaterials,
      consumptionByMonth,
      lowStockMaterials,
      totalMaterials: totalMaterialsCount,
      totalConsumption,
      totalCost,
      avgConsumptionPerJob,
    };

    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (_error) {
    console.error("Error fetching materials report:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials report" },
      { status: 500 }
    );
  }
}
