/**
 * Operators Reports Page
 * Operator KPIs, productivity, and performance analysis
 */

'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { useReports, type OperatorsReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function OperatorsReportsPage() {
  const { fetchOperatorsReport, loading } = useReports();
  const { exportOperators } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<OperatorsReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchOperatorsReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load operators report:', error);
    }
  };

  const handleExport = async () => {
    await exportOperators('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Operatori"
      description="KPIs operatori, productivitate și performanță"
      icon={<Users className="w-6 h-6 text-indigo-600" />}
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
            title="Productivitate Medie"
            value={`${report.metrics.averageProductivity}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="indigo"
          />
          <MetricCard
            title="Job-uri Medii/Zi"
            value={report.metrics.averageJobsPerDay.toFixed(1)}
            icon={<Target className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Ore Muncă Totale"
            value={`${report.metrics.totalWorkHours.toFixed(0)}h`}
            icon={<Clock className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Eficiență Medie"
            value={`${report.metrics.averageEfficiency}%`}
            icon={<Award className="w-5 h-5" />}
            color="purple"
          />
        </div>
      )}

      {/* Top Performers */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.topPerformers.slice(0, 3).map((operator, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{operator.name}</p>
                  <span className="text-2xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Productivitate</p>
                    <p className="font-bold text-yellow-700">{operator.productivityScore}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Job-uri</p>
                    <p className="font-bold text-yellow-700">{operator.jobsCompleted}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Operator Details */}
      {report && report.operators.map((operator, idx) => (
        <Card key={idx} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{operator.name}</h3>
              <p className="text-sm text-gray-600">{operator.role} • ID: {operator.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                operator.productivityRate >= 90 ? 'bg-green-100 text-green-800' :
                operator.productivityRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {operator.productivityRate}% productivitate
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 mb-1">Job-uri</p>
              <p className="text-lg font-bold text-blue-900">{operator.jobsCompleted}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Ore Muncă</p>
              <p className="text-lg font-bold text-green-900">{operator.workHours.toFixed(1)}h</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700 mb-1">Job/Oră</p>
              <p className="text-lg font-bold text-purple-900">{operator.jobsPerHour.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-700 mb-1">Eficiență</p>
              <p className="text-lg font-bold text-orange-900">{operator.efficiency}%</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-700 mb-1">Erori</p>
              <p className="text-lg font-bold text-red-900">{operator.errorCount}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700 mb-1">Calitate</p>
              <p className="text-lg font-bold text-yellow-900">{operator.qualityScore}%</p>
            </div>
          </div>

          {operator.specializations && operator.specializations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Specializări</p>
              <div className="flex flex-wrap gap-2">
                {operator.specializations.map((spec, sIdx) => (
                  <span key={sIdx} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Productivity Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Productivitate în Timp
        </h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
          <p className="text-gray-600">
            {loading ? 'Se încarcă graficul...' : 'Grafic Multi-Line Chart - Integrare Recharts'}
          </p>
        </div>
      </Card>

      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de operatori...</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
