"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingState, Table } from "@/components/ui";
import { KpiCard } from "@/components/KpiCard";
import { LineChart, BarChart, PieChart, DonutChart } from "@/components/charts";
import { useReports } from "@/modules/reports/useReports";
import type { SalesReport } from "@/modules/reports/types";

export default function SalesReportPage() {
  const { loading, getSales } = useReports();
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const loadData = async () => {
    setRefreshing(true);
    const data = await getSales();
    setSales(data);
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

  const filteredData = useMemo(() => {
    if (!sales) return null;

    let filteredBySource = sales.salesBySource;
    let filteredByChannel = sales.salesByChannel;

    if (sourceFilter !== "all") {
      filteredBySource = sales.salesBySource.filter(s => s.source === sourceFilter);
    }

    if (channelFilter !== "all") {
      filteredByChannel = sales.salesByChannel.filter(c => c.channel === channelFilter);
    }

    return {
      salesBySource: filteredBySource,
      salesByChannel: filteredByChannel,
    };
  }, [sales, sourceFilter, channelFilter]);

  if (loading && !sales) {
    return (
      <div className="p-6">
        <LoadingState text="Se încarcă raportul de vânzări..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive sales analytics and trends
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
      {sales && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(sales.totalRevenue)}
            icon={DollarSign}
            color="green"
          />
          <KpiCard
            title="Total Orders"
            value={sales.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            color="blue"
          />
          <KpiCard
            title="Average Order Value"
            value={formatCurrency(sales.totalRevenue / sales.totalOrders)}
            icon={TrendingUp}
            color="purple"
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              {sales?.salesBySource.map((s) => (
                <option key={s.source} value={s.source}>
                  {s.source}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel
            </label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Channels</option>
              {sales?.salesByChannel.map((c) => (
                <option key={c.channel} value={c.channel}>
                  {c.channel}
                </option>
              ))}
            </select>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Month */}
        {sales && (
          <Card>
            <CardHeader>
              <CardTitle>Sales Last 12 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
              data={sales.salesByMonth}
              xKey="month"
              lines={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
                { key: "orders", color: "#3b82f6", name: "Orders" },
              ]}
              height={350}
            />
            </CardContent>
          </Card>
        )}

        {/* Sales by Day */}
        {sales && (
          <Card>
            <CardHeader>
              <CardTitle>Sales Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
              data={sales.salesByDay}
              xKey="date"
              bars={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
              ]}
              height={350}
            />
            </CardContent>
          </Card>
        )}

        {/* Sales by Source */}
        {filteredData && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
              data={filteredData.salesBySource.map(s => ({
                name: s.source,
                value: s.revenue
              }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Sales by Channel */}
        {filteredData && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
              data={filteredData.salesByChannel.map(c => ({
                name: c.channel,
                value: c.revenue
              }))}
            />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Table */}
      {sales && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Data</CardTitle>
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
                  key: 'orders',
                  label: 'Orders',
                  sortable: true,
                  accessor: (row) => row.orders,
                  render: (row) => (
                    <span className="text-right block">{row.orders.toLocaleString()}</span>
                  )
                },
                {
                  key: 'revenue',
                  label: 'Revenue',
                  sortable: true,
                  accessor: (row) => row.revenue,
                  render: (row) => (
                    <span className="text-right block font-medium">{formatCurrency(row.revenue)}</span>
                  )
                },
                {
                  key: 'avgOrderValue',
                  label: 'Avg Order Value',
                  sortable: true,
                  accessor: (row) => row.avgOrderValue,
                  render: (row) => (
                    <span className="text-right block">{formatCurrency(row.avgOrderValue)}</span>
                  )
                }
              ]}
              data={sales.salesByMonth}
              rowKey="month"
              loading={loading}
              emptyMessage="No sales data available"
              clientSideSort={true}
              striped={true}
              responsive={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Status Breakdown */}
      {sales && (
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sales.salesByStatus.map((status) => (
              <div key={status.status} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{status.status}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{status.count.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{status.percentage.toFixed(1)}% of total</p>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
