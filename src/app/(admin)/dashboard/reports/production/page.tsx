/**
 * Production Reports Page
 * Production efficiency, job tracking, and bottleneck analysis
 */

'use client';

import { useState, useEffect } from 'react';
import { Factory, Zap, AlertTriangle, TrendingUp, Clock, Target } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useReports, type ProductionReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function ProductionReportsPage() {
  const { fetchProductionReport, loading } = useReports();
  const { exportProduction } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<ProductionReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchProductionReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load production report:', error);
    }
  };

  const handleExport = async () => {
    await exportProduction('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Producție"
      description="Eficiență producție, job tracking și analiză bottleneck-uri"
      icon={<Factory className="w-6 h-6 text-orange-600" />}
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
            title="Total Job-uri"
            value={report.metrics.totalJobs}
            icon={<Factory className="w-5 h-5" />}
            color="orange"
          />
          <MetricCard
            title="Eficiență Producție"
            value={`${report.metrics.productionEfficiency}%`}
            change={report.metrics.efficiencyTrend}
            icon={<Zap className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Timp Mediu Producție"
            value={`${report.metrics.averageProductionTime.toFixed(1)}h`}
            icon={<Clock className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Job-uri pe Zi"
            value={report.metrics.jobsPerDay.toFixed(1)}
            icon={<Target className="w-5 h-5" />}
            color="purple"
          />
        </div>
      )}

      {/* Production Status Overview */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Status Producție
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.byStatus.map((status, idx) => (
              <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <StatusBadge status={status.status} className="mb-2" />
                <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                <p className="text-sm text-gray-600 mt-1">{status.percentage}% din total</p>
                <p className="text-xs text-gray-500 mt-2">
                  Timp mediu: {status.averageTime.toFixed(1)}h
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bottlenecks Analysis */}
      {report && report.bottlenecks.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Bottleneck-uri Identificate
          </h3>
          <div className="space-y-3">
            {report.bottlenecks.map((bottleneck, idx) => (
              <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-red-900">{bottleneck.stage}</p>
                    <p className="text-sm text-red-700 mt-1">{bottleneck.description}</p>
                  </div>
                  <Badge variant="danger">CRITICAL</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-red-600 uppercase">Impact</p>
                    <p className="font-semibold text-red-900">{bottleneck.impact}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 uppercase">Job-uri Afectate</p>
                    <p className="font-semibold text-red-900">{bottleneck.affectedJobs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 uppercase">Întârziere Medie</p>
                    <p className="font-semibold text-red-900">{bottleneck.averageDelay.toFixed(1)}h</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-red-700">
                    <strong>Recomandare:</strong> {bottleneck.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Production by Machine & Operator */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Machine */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🖨️ Producție pe Mașină
            </h3>
            <div className="space-y-3">
              {report.byMachine.map((machine, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{machine.machineName}</p>
                    <span className={`text-sm font-semibold ${
                      machine.utilizationRate >= 80 ? 'text-green-600' :
                      machine.utilizationRate >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {machine.utilizationRate}% utilizare
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Job-uri</p>
                      <p className="font-semibold text-gray-900">{machine.jobsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Timp Total</p>
                      <p className="font-semibold text-gray-900">{machine.totalTime.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Eficiență</p>
                      <p className="font-semibold text-gray-900">{machine.efficiency}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* By Operator */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👷 Producție pe Operator
            </h3>
            <div className="space-y-3">
              {report.byOperator.map((operator, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{operator.operatorName}</p>
                    <span className={`text-sm font-semibold ${
                      operator.productivityRate >= 90 ? 'text-green-600' :
                      operator.productivityRate >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {operator.productivityRate}% productivitate
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Job-uri</p>
                      <p className="font-semibold text-gray-900">{operator.jobsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ore Muncă</p>
                      <p className="font-semibold text-gray-900">{operator.workHours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Job/Oră</p>
                      <p className="font-semibold text-gray-900">{operator.jobsPerHour.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Production Efficiency Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Eficiență Producție în Timp
        </h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
          <p className="text-gray-600">
            {loading ? 'Se încarcă graficul...' : 'Grafic Area Chart - Integrare Recharts'}
          </p>
        </div>
      </Card>

      {/* Loading State */}
      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de producție...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Factory className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nu există date de producție pentru perioada selectată</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
