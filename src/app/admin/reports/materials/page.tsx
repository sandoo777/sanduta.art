"use client";

import { useEffect, useState } from "react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { ArrowLeft, RefreshCw, Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingState, Table, Badge } from "@/components/ui";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <LoadingState text="Se încarcă raportul de materiale..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AuthLink
            href="/admin/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </AuthLink>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materials & Inventory Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Material consumption, costs, and inventory tracking
            </p>
          </div>
        </div>
        <Button
          onClick={loadData}
          disabled={refreshing}
          variant="primary"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
                  <Badge variant="danger" size="sm">
                    LOW
                  </Badge>
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
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Consumed Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={materials.topConsumedMaterials.slice(0, 10)}
                xKey="name"
                bars={[
                  { key: "totalConsumed", color: "#3b82f6", name: "Quantity" },
                ]}
                height={350}
              />
            </CardContent>
          </Card>
        )}

        {/* Material Costs */}
        {materials && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 by Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={materials.topConsumedMaterials.slice(0, 10)}
                xKey="name"
                bars={[
                  { key: "totalCost", color: "#10b981", name: "Cost" },
                ]}
                height={350}
                layout="vertical"
              />
            </CardContent>
          </Card>
        )}

        {/* Consumption by Month */}
        {materials && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Consumption Last 12 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={materials.consumptionByMonth}
                xKey="month"
                lines={[
                  { key: "totalQuantity", color: "#3b82f6", name: "Quantity" },
                  { key: "totalCost", color: "#10b981", name: "Cost" },
                ]}
                height={350}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Materials Table */}
      {materials && (
        <Card>
          <CardHeader>
            <CardTitle>Material Consumption Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={[
                {
                  key: 'material',
                  label: 'Material',
                  sortable: true,
                  accessor: (row) => row.name,
                  render: (row) => (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.sku}</p>
                    </div>
                  )
                },
                {
                  key: 'unit',
                  label: 'Unit',
                  accessor: 'unit',
                  render: (row) => (
                    <span className="text-right block">{row.unit}</span>
                  )
                },
                {
                  key: 'consumed',
                  label: 'Consumed',
                  sortable: true,
                  accessor: (row) => row.totalConsumed,
                  render: (row) => (
                    <span className="text-right block font-medium">
                      {row.totalConsumed.toLocaleString()}
                    </span>
                  )
                },
                {
                  key: 'costPerUnit',
                  label: 'Cost/Unit',
                  sortable: true,
                  accessor: (row) => row.totalCost / row.totalConsumed,
                  render: (row) => (
                    <span className="text-right block">
                      {formatCurrency(row.totalCost / row.totalConsumed)}
                    </span>
                  )
                },
                {
                  key: 'totalCost',
                  label: 'Total Cost',
                  sortable: true,
                  accessor: (row) => row.totalCost,
                  render: (row) => (
                    <span className="text-right block font-medium">
                      {formatCurrency(row.totalCost)}
                    </span>
                  )
                },
                {
                  key: 'usageCount',
                  label: 'Usage Count',
                  sortable: true,
                  accessor: (row) => row.usageCount,
                  render: (row) => (
                    <span className="text-right block">{row.usageCount}</span>
                  )
                }
              ]}
              data={materials.topConsumedMaterials}
              rowKey="id"
              loading={loading}
              emptyMessage="No materials data available"
              clientSideSort={true}
              striped={true}
              responsive={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */
      {materials && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Consumption Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={[
                {
                  key: 'month',
                  label: 'Month',
                  sortable: true,
                  accessor: 'month'
                },
                {
                  key: 'quantity',
                  label: 'Quantity',
                  sortable: true,
                  accessor: (row) => row.totalQuantity,
                  render: (row) => (
                    <span className="text-right block font-medium">
                      {row.totalQuantity.toLocaleString()}
                    </span>
                  )
                },
                {
                  key: 'cost',
                  label: 'Cost',
                  sortable: true,
                  accessor: (row) => row.totalCost,
                  render: (row) => (
                    <span className="text-right block font-medium">
                      {formatCurrency(row.totalCost)}
                    </span>
                  )
                },
                {
                  key: 'materialsUsed',
                  label: 'Materials Used',
                  sortable: true,
                  accessor: (row) => row.materialsUsed,
                  render: (row) => (
                    <span className="text-right block">{row.materialsUsed}</span>
                  )
                }
              ]}
              data={materials.consumptionByMonth}
              rowKey="month"
              loading={loading}
              emptyMessage="No monthly data available"
              clientSideSort={true}
              striped={true}
              responsive={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
