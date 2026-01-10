/**
 * Profitability Reports Page
 * Profit margins, revenue vs costs, profitability analysis
 */

'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Target } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { useReports, type ProfitabilityReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function ProfitabilityReportsPage() {
  const { fetchProfitabilityReport, loading } = useReports();
  const { exportProfitability } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<ProfitabilityReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchProfitabilityReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load profitability report:', error);
    }
  };

  const handleExport = async () => {
    await exportProfitability('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Profitabilitate"
      description="Analiza profit, marje și rentabilitate"
      icon={<TrendingUp className="w-6 h-6 text-green-600" />}
      onRefresh={loadReport}
      onExport={handleExport}
      loading={loading}
    >
      <DateRangePicker
        from={dateRange.from}
        to={dateRange.to}
        onChange={(from, to) => setDateRange({ from, to })}
      />

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Profit Net"
            value={`${report.metrics.netProfit.toLocaleString('ro-RO')} RON`}
            change={report.metrics.profitGrowth}
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Marjă Brută"
            value={`${report.metrics.grossMargin}%`}
            icon={<Percent className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Marjă Netă"
            value={`${report.metrics.netMargin}%`}
            icon={<Target className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="ROI"
            value={`${report.metrics.roi}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="orange"
          />
        </div>
      )}

      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💰 Revenue vs Costs vs Profit
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">Revenue Total</p>
              <p className="text-2xl font-bold text-blue-900">
                {report.financial.totalRevenue.toLocaleString('ro-RO')} RON
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 mb-1">Costuri Totale</p>
              <p className="text-2xl font-bold text-red-900">
                {report.financial.totalCosts.toLocaleString('ro-RO')} RON
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Profit Net</p>
              <p className="text-2xl font-bold text-green-900">
                {report.financial.netProfit.toLocaleString('ro-RO')} RON
              </p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
            <p className="text-gray-600">Grafic Waterfall Chart - Integrare Recharts</p>
          </div>
        </Card>
      )}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Profit pe Produs
            </h3>
            {report.byProduct.map((product, idx) => (
              <div key={idx} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{product.productName}</span>
                  <span className={`font-semibold ${
                    product.profitMargin >= 30 ? 'text-green-600' :
                    product.profitMargin >= 15 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {product.profitMargin}% marjă
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold">{product.revenue.toLocaleString('ro-RO')} RON</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cost</p>
                    <p className="font-semibold">{product.cost.toLocaleString('ro-RO')} RON</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Profit</p>
                    <p className="font-semibold">{product.profit.toLocaleString('ro-RO')} RON</p>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏷️ Profit pe Categorie
            </h3>
            {report.byCategory.map((category, idx) => (
              <div key={idx} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{category.category}</span>
                  <span className={`font-semibold ${
                    category.profitMargin >= 30 ? 'text-green-600' :
                    category.profitMargin >= 15 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {category.profitMargin}% marjă
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold">{category.revenue.toLocaleString('ro-RO')} RON</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cost</p>
                    <p className="font-semibold">{category.cost.toLocaleString('ro-RO')} RON</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Profit</p>
                    <p className="font-semibold">{category.profit.toLocaleString('ro-RO')} RON</p>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de profitabilitate...</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
