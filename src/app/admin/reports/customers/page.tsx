"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Users, DollarSign, TrendingUp, Target } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Table, LoadingState } from "@/components/ui";
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
        <LoadingState text="Se încarcă raportul de clienți..." />
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
          <Card>
            <CardHeader>
              <CardTitle>New Customers by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={customers.newCustomersByMonth}
                xKey="month"
                lines={[
                  { key: "count", color: "#8b5cf6", name: "New Customers" },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        )}

        {/* Customer Segments */}
        {customers && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Value Segments</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Returning vs New */}
        {customers && (
          <Card>
            <CardHeader>
              <CardTitle>Returning vs New Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={[
                  { name: "Returning", value: customers.returningCustomers.total },
                  { name: "One-time", value: customers.totalCustomers - customers.returningCustomers.total },
                ]}
              />
            </CardContent>
          </Card>
        )}

        {/* CLV Distribution */}
        {customers && (
          <Card>
            <CardHeader>
              <CardTitle>CLV Statistics</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Customers Table */}
      {customers && (
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={[
                {
                  key: 'customer',
                  label: 'Customer',
                  sortable: true,
                  accessor: (row) => row.name,
                  render: (row) => (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                      {row.phone && (
                        <p className="text-xs text-gray-500">{row.phone}</p>
                      )}
                    </div>
                  )
                },
                {
                  key: 'orders',
                  label: 'Orders',
                  sortable: true,
                  accessor: (row) => row.totalOrders,
                  render: (row) => (
                    <span className="text-right block">{row.totalOrders}</span>
                  )
                },
                {
                  key: 'totalSpent',
                  label: 'Total Spent',
                  sortable: true,
                  accessor: (row) => row.totalSpent,
                  render: (row) => (
                    <span className="text-right block font-medium">{formatCurrency(row.totalSpent)}</span>
                  )
                },
                {
                  key: 'avgOrder',
                  label: 'Avg Order',
                  sortable: true,
                  accessor: (row) => row.avgOrderValue,
                  render: (row) => (
                    <span className="text-right block">{formatCurrency(row.avgOrderValue)}</span>
                  )
                },
                {
                  key: 'lastOrder',
                  label: 'Last Order',
                  sortable: true,
                  accessor: (row) => row.lastOrderDate,
                  render: (row) => (
                    <span className="text-gray-500">
                      {new Date(row.lastOrderDate).toLocaleDateString("ro-RO")}
                    </span>
                  )
                }
              ]}
              data={customers.topCustomers}
              rowKey="id"
              loading={loading}
              emptyMessage="No customers data available"
              clientSideSort={true}
              striped={true}
              responsive={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Segment Details */}
      {customers && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
