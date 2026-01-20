"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Users, DollarSign, TrendingUp, Target } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { LineChart, DonutChart, BarChart } from "@/components/charts";
import { useReports } from "@/modules/reports/useReports";
import type { CustomersReport } from "@/modules/reports/types";

export default function CustomersReportPage() {
  const { loading, getCustomers } = useReports();
  const [customers, setCustomers] = useState<CustomersReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const data = await getCustomers();
    setCustomers(data);
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

  if (loading && !customers) {
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
            <h1 className="text-2xl font-bold text-gray-900">Customer Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Customer lifetime value and segmentation analysis
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
      {customers && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard
            title="Total Customers"
            value={customers.totalCustomers.toLocaleString()}
            icon={Users}
            color="purple"
          />
          <KpiCard
            title="Average CLV"
            value={formatCurrency(customers.customerLifetimeValue.average)}
            icon={DollarSign}
            color="green"
          />
          <KpiCard
            title="Median CLV"
            value={formatCurrency(customers.customerLifetimeValue.median)}
            icon={TrendingUp}
            color="blue"
          />
          <KpiCard
            title="Returning Customers"
            value={`${customers.returningCustomers.percentage.toFixed(1)}%`}
            icon={Target}
            color="amber"
            subtitle={`${customers.returningCustomers.total} customers`}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Customers by Month */}
        {customers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Customers by Month</h2>
            <LineChart
              data={customers.newCustomersByMonth}
              xKey="month"
              lines={[
                { key: "count", color: "#8b5cf6", name: "New Customers" },
              ]}
              height={300}
            />
          </div>
        )}

        {/* Customer Segments */}
        {customers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Value Segments</h2>
            <BarChart
              data={[
                { segment: "High Value", count: customers.customerSegments.high },
                { segment: "Medium Value", count: customers.customerSegments.medium },
                { segment: "Low Value", count: customers.customerSegments.low },
              ]}
              xKey="segment"
              bars={[
                { key: "count", color: "#10b981", name: "Customers" },
              ]}
              height={300}
            />
          </div>
        )}

        {/* Returning vs New */}
        {customers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Returning vs New Customers</h2>
            <DonutChart
              data={[
                { name: "Returning", value: customers.returningCustomers.total },
                { name: "One-time", value: customers.totalCustomers - customers.returningCustomers.total },
              ]}
            />
          </div>
        )}

        {/* CLV Distribution */}
        {customers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">CLV Statistics</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Customer Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(customers.customerLifetimeValue.total)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Average CLV</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(customers.customerLifetimeValue.average)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Median CLV</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(customers.customerLifetimeValue.median)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Customers Table */}
      {customers && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Orders</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Total Spent</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Avg Order</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {customers.topCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(customer.totalSpent)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(customer.avgOrderValue)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(customer.lastOrderDate).toLocaleDateString("ro-RO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Segment Details */}
      {customers && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <p className="text-sm font-medium text-gray-900">High Value</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{customers.customerSegments.high}</p>
              <p className="text-sm text-gray-600 mt-1">
                {((customers.customerSegments.high / customers.totalCustomers) * 100).toFixed(1)}% of customers
              </p>
              <p className="text-xs text-gray-500 mt-2">Above average + 1 std dev</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <p className="text-sm font-medium text-gray-900">Medium Value</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{customers.customerSegments.medium}</p>
              <p className="text-sm text-gray-600 mt-1">
                {((customers.customerSegments.medium / customers.totalCustomers) * 100).toFixed(1)}% of customers
              </p>
              <p className="text-xs text-gray-500 mt-2">Within 1 std dev of average</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                <p className="text-sm font-medium text-gray-900">Low Value</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{customers.customerSegments.low}</p>
              <p className="text-sm text-gray-600 mt-1">
                {((customers.customerSegments.low / customers.totalCustomers) * 100).toFixed(1)}% of customers
              </p>
              <p className="text-xs text-gray-500 mt-2">Below average - 1 std dev</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
