"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Package, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { BarChart, PieChart } from "@/components/charts";
import { useReports } from "@/modules/reports/useReports";
import type { ProductsReport } from "@/modules/reports/types";

export default function ProductsReportPage() {
  const { loading, getProducts } = useReports();
  const [products, setProducts] = useState<ProductsReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const loadData = async () => {
    setRefreshing(true);
    const data = await getProducts();
    setProducts(data);
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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (categoryFilter === "all") return products.topSellingProducts;
    
    const category = products.productsByCategory.find(c => c.categoryId === categoryFilter);
    if (!category) return products.topSellingProducts;
    
    return products.topSellingProducts.filter(p => 
      products.productsByCategory.some(c => c.categoryId === categoryFilter)
    );
  }, [products, categoryFilter]);

  if (loading && !products) {
    return (
      <div className="p-6">
        <LoadingState text="Se încarcă raportul de produse..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Products Performance</h1>
            <p className="text-sm text-gray-600 mt-1">
              Product sales analytics and category insights
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
      {products && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            title="Total Products"
            value={products.totalProducts.toLocaleString()}
            icon={Package}
            color="blue"
          />
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(products.totalRevenue)}
            icon={DollarSign}
            color="green"
          />
          <KpiCard
            title="Avg Product Revenue"
            value={formatCurrency(products.totalRevenue / products.totalProducts)}
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
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {products?.productsByCategory.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        {products && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Selling Products</h2>
            <BarChart
              data={products.topSellingProducts.slice(0, 10)}
              xKey="name"
              bars={[
                { key: "quantity", color: "#3b82f6", name: "Quantity Sold" },
              ]}
              height={350}
            />
          </div>
        )}

        {/* Revenue by Product */}
        {products && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Revenue Products</h2>
            <BarChart
              data={products.revenueByProduct.slice(0, 10)}
              xKey="name"
              bars={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
              ]}
              height={350}
              layout="vertical"
            />
          </div>
        )}

        {/* Products by Category */}
        {products && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h2>
            <PieChart
              data={products.productsByCategory.map(c => ({
                name: c.categoryName,
                value: c.productsCount
              }))}
            />
          </div>
        )}

        {/* Revenue by Category */}
        {products && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
            <PieChart
              data={products.productsByCategory.map(c => ({
                name: c.categoryName,
                value: c.revenue
              }))}
            />
          </div>
        )}
      </div>

      {/* Products Table */}
      {products && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Avg Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.slice(0, 20).map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{product.quantity.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(product.revenue)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(product.avgPrice)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {((product.revenue / products.totalRevenue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Summary */}
      {products && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.productsByCategory.map((category) => (
              <div key={category.categoryId} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{category.categoryName}</p>
                <p className="text-xs text-gray-600 mt-1">{category.productsCount} products</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(category.revenue)}</p>
                <p className="text-sm text-gray-600 mt-1">{category.totalQuantity.toLocaleString()} units sold</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
