/**
 * Sales Reports Page
 * Comprehensive sales analytics and revenue tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, TrendingDown } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { useReports, type SalesReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function SalesReportsPage() {
  const { fetchSalesReport, loading } = useReports();
  const { exportSales } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<SalesReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchSalesReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load sales report:', error);
    }
  };

  const handleExport = async () => {
    await exportSales('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Vânzări"
      description="Analiză completă vânzări, revenue și performanță"
      icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
      onRefresh={loadReport}
      onExport={handleExport}
      loading={loading}
    >
      {/* Date Range Filter */}
      <DateRangePicker
        from={dateRange.from}
        to={dateRange.to}
        onChange={(from, to) => setDateRange({ from, to })}
      />

      {/* Key Metrics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Revenue Total"
            value={`${report.metrics.totalRevenue.toLocaleString('ro-RO')} RON`}
            change={report.metrics.growthRate}
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Total Comenzi"
            value={report.metrics.totalOrders}
            icon={<ShoppingBag className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Valoare Medie Comandă"
            value={`${report.metrics.averageOrderValue.toLocaleString('ro-RO')} RON`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Clienți Activi"
            value={report.topCustomers.length}
            icon={<Users className="w-5 h-5" />}
            color="orange"
          />
        </div>
      )}

      {/* Sales by Period Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Vânzări pe Perioadă
        </h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-gray-600">
            {loading ? 'Se încarcă graficul...' : 'Grafic Line Chart - Integrare Recharts'}
          </p>
        </div>
      </Card>

      {/* Sales by Category */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏷️ Vânzări pe Categorie
            </h3>
            <div className="space-y-3">
              {report.byCategory.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                      <span className="text-sm text-gray-600">{cat.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-semibold text-gray-900">
                    {cat.revenue.toLocaleString('ro-RO')} RON
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⭐ Top Produse
            </h3>
            <div className="space-y-3">
              {report.byProduct.slice(0, 5).map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">
                      {product.quantity} bucăți • {product.averagePrice.toLocaleString('ro-RO')} RON/buc
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {product.revenue.toLocaleString('ro-RO')} RON
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Top Customers */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            👥 Top Clienți
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Comenzi</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Revenue Total</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Valoare Medie</th>
                </tr>
              </thead>
              <tbody>
                {report.topCustomers.map((customer, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{customer.customerName}</p>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{customer.ordersCount}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {customer.totalRevenue.toLocaleString('ro-RO')} RON
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {(customer.totalRevenue / customer.ordersCount).toLocaleString('ro-RO')} RON
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de vânzări...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <TrendingDown className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nu există date pentru perioada selectată</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
