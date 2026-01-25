"use client";

import { useEffect, useState, useMemo } from "react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { ArrowLeft, RefreshCw, Package, DollarSign, TrendingUp } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Table, LoadingState } from "@/components/ui";
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
          <AuthLink
            href="/admin/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </AuthLink>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Performance</h1>
            <p className="text-sm text-gray-600 mt-1">
              Product sales analytics and category insights
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
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        {products && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
              data={products.topSellingProducts.slice(0, 10)}
              xKey="name"
              bars={[
                { key: "quantity", color: "#3b82f6", name: "Quantity Sold" },
              ]}
              height={350}
            />
            </CardContent>
          </Card>
        )}

        {/* Revenue by Product */}
        {products && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Revenue Products</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
              data={products.revenueByProduct.slice(0, 10)}
              xKey="name"
              bars={[
                { key: "revenue", color: "#10b981", name: "Revenue" },
              ]}
              height={350}
              layout="vertical"
            />
            </CardContent>
          </Card>
        )}

        {/* Products by Category */}
        {products && (
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
              data={products.productsByCategory.map(c => ({
                name: c.categoryName,
                value: c.productsCount
              }))}
            />
            </CardContent>
          </Card>
        )}

        {/* Revenue by Category */}
        {products && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
              data={products.productsByCategory.map(c => ({
                name: c.categoryName,
                value: c.revenue
              }))}
            />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Table */}
      {products && (
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={[
                {
                  key: 'product',
                  label: 'Product',
                  sortable: true,
                  render: (row) => (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.sku}</p>
                    </div>
                  )
                },
                {
                  key: 'quantity',
                  label: 'Quantity',
                  sortable: true,
                  accessor: (row) => row.quantity,
                  render: (row) => (
                    <span className="text-right block">{row.quantity.toLocaleString()}</span>
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
                  key: 'avgPrice',
                  label: 'Avg Price',
                  sortable: true,
                  accessor: (row) => row.avgPrice,
                  render: (row) => (
                    <span className="text-right block">{formatCurrency(row.avgPrice)}</span>
                  )
                },
                {
                  key: 'percentage',
                  label: '% of Total',
                  render: (row) => (
                    <span className="text-right block">
                      {((row.revenue / products.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  )
                }
              ]}
              data={filteredProducts.slice(0, 20)}
              rowKey="id"
              loading={loading}
              emptyMessage="No products found"
              clientSideSort={true}
              striped={true}
              responsive={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Category Summary */}
      {products && (
        <Card>
          <CardHeader>
            <CardTitle>Category Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.productsByCategory.map((category) => (
              <div key={category.categoryId} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{category.categoryName}</p>
                <p className="text-xs text-gray-600 mt-1">{category.productsCount} products</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(category.revenue)}</p>
                <p className="text-sm text-gray-600 mt-1">{category.totalQuantity.toLocaleString()} units sold</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
