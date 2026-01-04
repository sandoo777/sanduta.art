"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Award,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { LineChart, BarChart, PieChart, DonutChart } from "@/components/charts";
import { useReports } from "@/modules/reports/useReports";
import type { 
  OverviewKPIs, 
  SalesReport, 
  ProductsReport,
  CustomersReport,
  MaterialsReport 
} from "@/modules/reports/types";

export default function ReportsPage() {
  const { loading, getOverview, getSales, getProducts, getCustomers, getMaterials } = useReports();
  const [overview, setOverview] = useState<OverviewKPIs | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [products, setProducts] = useState<ProductsReport | null>(null);
  const [customers, setCustomers] = useState<CustomersReport | null>(null);
  const [materials, setMaterials] = useState<MaterialsReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const [overviewData, salesData, productsData, customersData, materialsData] = await Promise.all([
      getOverview(),
      getSales(),
      getProducts(),
      getCustomers(),
      getMaterials(),
    ]);
    
    setOverview(overviewData);
    setSales(salesData);
    setProducts(productsData);
    setCustomers(customersData);
    setMaterials(materialsData);
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

  if (loading && !overview) {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive business intelligence and performance metrics
          </p>
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

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(overview.totalRevenue)}
            icon={DollarSign}
            color="green"
            trend={overview.monthlyGrowth ? {
              value: overview.monthlyGrowth,
              isPositive: overview.monthlyGrowth > 0
            } : undefined}
          />
          <KpiCard
            title="Total Orders"
            value={overview.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            color="blue"
            trend={overview.ordersGrowth ? {
              value: overview.ordersGrowth,
              isPositive: overview.ordersGrowth > 0
            } : undefined}
          />
          <KpiCard
            title="Total Customers"
            value={overview.totalCustomers.toLocaleString()}
            icon={Users}
            color="purple"
          />
          <KpiCard
            title="Total Products"
            value={overview.totalProducts.toLocaleString()}
            icon={Package}
            color="amber"
          />
          <KpiCard
            title="Orders This Month"
            value={overview.monthlyOrders.toLocaleString()}
            icon={Calendar}
            color="blue"
          />
          <KpiCard
            title="Revenue This Month"
            value={formatCurrency(overview.monthlyRevenue)}
            icon={TrendingUp}
            color="green"
          />
          <KpiCard
            title="Average Order Value"
            value={formatCurrency(overview.avgOrderValue)}
            icon={DollarSign}
            color="purple"
          />
          {overview.topSellingProduct && (
            <KpiCard
              title="Top Product"
              value={overview.topSellingProduct.sales.toLocaleString()}
              icon={Award}
              color="pink"
              subtitle={overview.topSellingProduct.name}
            />
          )}
        </div>
      )}

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Last 12 Months */}
        {sales && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sales Last 12 Months</h2>
              <Link
                href="/admin/reports/sales"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <LineChart
              data={sales.salesByMonth}
              xKey="month"
              lines={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
                { key: "orders", color: "#3b82f6", name: "Orders" },
              ]}
            />
          </div>
        )}

        {/* Sales Last 30 Days */}
        {sales && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sales Last 30 Days</h2>
              <Link
                href="/admin/reports/sales"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <BarChart
              data={sales.salesByDay}
              xKey="date"
              bars={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
              ]}
            />
          </div>
        )}

        {/* Orders by Status */}
        {sales && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
            <PieChart
              data={sales.salesByStatus.map(s => ({
                name: s.status,
                value: s.count
              }))}
            />
          </div>
        )}

        {/* Revenue by Source */}
        {sales && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h2>
            <DonutChart
              data={sales.salesBySource.map(s => ({
                name: s.source,
                value: s.revenue
              }))}
            />
          </div>
        )}
      </div>

      {/* Quick Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products */}
        {products && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top 5 Products</h2>
              <Link
                href="/admin/reports/products"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {products.topSellingProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 5 Customers */}
        {customers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top 5 Customers</h2>
              <Link
                href="/admin/reports/customers"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {customers.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Low Stock Materials Alert */}
      {materials && materials.lowStockMaterials.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-lg font-semibold text-red-900">Low Stock Materials</h2>
              <p className="text-sm text-red-700">
                {materials.lowStockMaterials.length} materials are running low
              </p>
            </div>
            <Link
              href="/admin/reports/materials"
              className="ml-auto text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.lowStockMaterials.slice(0, 6).map((material) => (
              <div key={material.id} className="bg-white rounded-lg p-4 border border-red-200">
                <p className="font-medium text-gray-900">{material.name}</p>
                <p className="text-sm text-gray-600">{material.sku}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-red-600">
                    Stock: {material.currentStock}
                  </span>
                  <span className="text-xs text-gray-500">
                    Min: {material.minStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { href: "/admin/reports/sales", label: "Sales Report", icon: DollarSign, color: "bg-green-600" },
          { href: "/admin/reports/products", label: "Products", icon: Package, color: "bg-blue-600" },
          { href: "/admin/reports/customers", label: "Customers", icon: Users, color: "bg-purple-600" },
          { href: "/admin/reports/operators", label: "Operators", icon: Award, color: "bg-amber-600" },
          { href: "/admin/reports/materials", label: "Materials", icon: AlertTriangle, color: "bg-red-600" },
          { href: "/admin/orders", label: "Orders", icon: ShoppingCart, color: "bg-pink-600" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-lg ${link.color}`}>
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
