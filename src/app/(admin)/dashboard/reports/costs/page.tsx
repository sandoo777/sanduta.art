/**
 * Cost Reports Page
 * Material costs, labor costs, and expense tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Package, Users, Settings, TrendingDown } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { useReports, type CostReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function CostReportsPage() {
  const { fetchCostsReport, loading } = useReports();
  const { exportCosts } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<CostReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchCostsReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load costs report:', error);
    }
  };

  const handleExport = async () => {
    await exportCosts('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Costuri"
      description="Analiza costurilor: materiale, manoperă, echipamente"
      icon={<DollarSign className="w-6 h-6 text-red-600" />}
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
            title="Costuri Totale"
            value={`${report.metrics.totalCosts.toLocaleString('ro-RO')} RON`}
            change={report.metrics.costTrend}
            icon={<DollarSign className="w-5 h-5" />}
            color="red"
          />
          <MetricCard
            title="Costuri Materiale"
            value={`${report.metrics.materialCosts.toLocaleString('ro-RO')} RON`}
            icon={<Package className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Costuri Manoperă"
            value={`${report.metrics.laborCosts.toLocaleString('ro-RO')} RON`}
            icon={<Users className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Costuri Echipamente"
            value={`${report.metrics.equipmentCosts.toLocaleString('ro-RO')} RON`}
            icon={<Settings className="w-5 h-5" />}
            color="orange"
          />
        </div>
      )}

      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Distribuție Costuri
          </h3>
          <div className="space-y-4">
            {report.byCategory.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{category.category}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {category.amount.toLocaleString('ro-RO')} RON
                    </span>
                    <span className="text-xs text-gray-600 ml-2">({category.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📦 Top Materiale (Cost)
            </h3>
            <div className="space-y-2">
              {report.topMaterials.map((material, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-900">{material.materialName}</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      {material.totalCost.toLocaleString('ro-RO')} RON
                    </span>
                    <span className="text-xs text-gray-600 ml-2">({material.quantity} unități)</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👷 Manoperă pe Operator
            </h3>
            <div className="space-y-2">
              {report.laborByOperator.map((operator, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-900">{operator.operatorName}</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      {operator.totalCost.toLocaleString('ro-RO')} RON
                    </span>
                    <span className="text-xs text-gray-600 ml-2">({operator.hoursWorked}h)</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Evoluție Costuri
        </h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
          <p className="text-gray-600">
            {loading ? 'Se încarcă graficul...' : 'Grafic Multi-Line Chart - Integrare Recharts'}
          </p>
        </div>
      </Card>

      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de costuri...</p>
          </div>
        </Card>
      )}

      {!loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <TrendingDown className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nu există date de costuri pentru perioada selectată</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
