"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
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
            <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive sales analytics and trends
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
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
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Month */}
        {sales && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Last 12 Months</h2>
            <LineChart
              data={sales.salesByMonth}
              xKey="month"
              lines={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
                { key: "orders", color: "#3b82f6", name: "Orders" },
              ]}
              height={350}
            />
          </div>
        )}

        {/* Sales by Day */}
        {sales && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Last 30 Days</h2>
            <BarChart
              data={sales.salesByDay}
              xKey="date"
              bars={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
              ]}
              height={350}
            />
          </div>
        )}

        {/* Sales by Source */}
        {filteredData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h2>
            <PieChart
              data={filteredData.salesBySource.map(s => ({
                name: s.source,
                value: s.revenue
              }))}
            />
          </div>
        )}

        {/* Sales by Channel */}
        {filteredData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Channel</h2>
            <DonutChart
              data={filteredData.salesByChannel.map(c => ({
                name: c.channel,
                value: c.revenue
              }))}
            />
          </div>
        )}
      </div>

      {/* Table */}
      {sales && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Orders</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {sales.salesByMonth.map((month) => (
                  <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{month.month}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{month.orders.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(month.revenue)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(month.avgOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {sales && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sales.salesByStatus.map((status) => (
              <div key={status.status} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{status.status}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{status.count.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{status.percentage.toFixed(1)}% of total</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
