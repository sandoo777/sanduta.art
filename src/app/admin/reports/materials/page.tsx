"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { BarChart, LineChart } from "@/components/charts";
import { useReports } from "@/modules/reports/useReports";
import type { MaterialsReport } from "@/modules/reports/types";

export default function MaterialsReportPage() {
  const { loading, getMaterials } = useReports();
  const [materials, setMaterials] = useState<MaterialsReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const data = await getMaterials();
    setMaterials(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(value);
  };

  if (loading && !materials) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materials & Inventory Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Material consumption, costs, and inventory tracking
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPIs */}
      {materials && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard
            title="Total Materials"
            value={materials.totalMaterials.toLocaleString()}
            icon={Package}
            color="blue"
          />
          <KpiCard
            title="Total Consumption"
            value={materials.totalConsumption.toLocaleString()}
            icon={TrendingUp}
            color="purple"
          />
          <KpiCard
            title="Total Cost"
            value={formatCurrency(materials.totalCost)}
            icon={DollarSign}
            color="green"
          />
          <KpiCard
            title="Avg per Job"
            value={formatCurrency(materials.avgConsumptionPerJob)}
            icon={AlertTriangle}
            color="amber"
          />
        </div>
      )}

      {/* Low Stock Alert */}
      {materials && materials.lowStockMaterials.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-lg font-semibold text-red-900">Low Stock Alert</h2>
              <p className="text-sm text-red-700">
                {materials.lowStockMaterials.length} materials need restocking
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.lowStockMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{material.name}</p>
                    <p className="text-sm text-gray-600">{material.sku}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    LOW
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium text-red-600">{material.currentStock}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Minimum:</span>
                    <span className="font-medium">{material.minStock}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shortage:</span>
                    <span className="font-medium text-red-600">{Math.abs(material.difference)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost/unit:</span>
                    <span className="font-medium">{formatCurrency(material.costPerUnit)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consumed Materials */}
        {materials && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Consumed Materials</h2>
            <BarChart
              data={materials.topConsumedMaterials.slice(0, 10)}
              xKey="name"
              bars={[
                { key: "totalConsumed", color: "#3b82f6", name: "Quantity" },
              ]}
              height={350}
            />
          </div>
        )}

        {/* Material Costs */}
        {materials && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 by Cost</h2>
            <BarChart
              data={materials.topConsumedMaterials.slice(0, 10)}
              xKey="name"
              bars={[
                { key: "totalCost", color: "#10b981", name: "Cost" },
              ]}
              height={350}
              layout="vertical"
            />
          </div>
        )}

        {/* Consumption by Month */}
        {materials && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consumption Last 12 Months</h2>
            <LineChart
              data={materials.consumptionByMonth}
              xKey="month"
              lines={[
                { key: "totalQuantity", color: "#3b82f6", name: "Quantity" },
                { key: "totalCost", color: "#10b981", name: "Cost" },
              ]}
              height={350}
            />
          </div>
        )}
      </div>

      {/* Materials Table */}
      {materials && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Material Consumption Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Material</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Unit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Consumed</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Cost/Unit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Total Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Usage Count</th>
                </tr>
              </thead>
              <tbody>
                {materials.topConsumedMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{material.name}</p>
                        <p className="text-xs text-gray-500">{material.sku}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{material.unit}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {material.totalConsumed.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {formatCurrency(material.totalCost / material.totalConsumed)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(material.totalCost)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{material.usageCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      {materials && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Consumption Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Materials Used</th>
                </tr>
              </thead>
              <tbody>
                {materials.consumptionByMonth.map((month) => (
                  <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{month.month}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {month.totalQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(month.totalCost)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{month.materialsUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
