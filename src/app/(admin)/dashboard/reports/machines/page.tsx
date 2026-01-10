/**
 * Machines Reports Page
 * Equipment utilization, uptime, and performance analysis
 */

'use client';

import { useState, useEffect } from 'react';
import { Settings, Zap, Clock, AlertTriangle } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useReports, type MachinesReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function MachinesReportsPage() {
  const { fetchMachinesReport, loading } = useReports();
  const { exportMachines } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<MachinesReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchMachinesReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load machines report:', error);
    }
  };

  const handleExport = async () => {
    await exportMachines('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Mașini"
      description="Utilizare echipamente, uptime și performanță"
      icon={<Settings className="w-6 h-6 text-purple-600" />}
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
            title="Utilizare Medie"
            value={`${report.metrics.averageUtilization}%`}
            icon={<Zap className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Uptime Total"
            value={`${report.metrics.totalUptime}%`}
            icon={<Clock className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Downtime Total"
            value={`${report.metrics.totalDowntime}h`}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
          <MetricCard
            title="Eficiență Medie"
            value={`${report.metrics.averageEfficiency}%`}
            icon={<Settings className="w-5 h-5" />}
            color="blue"
          />
        </div>
      )}

      {report && report.machines.map((machine, idx) => (
        <Card key={idx} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
              <p className="text-sm text-gray-600">{machine.type} • {machine.model}</p>
            </div>
            <StatusBadge status={machine.status} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-700 mb-1">Utilizare</p>
              <p className="text-lg font-bold text-purple-900">{machine.utilizationRate}%</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Uptime</p>
              <p className="text-lg font-bold text-green-900">{machine.uptime}%</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-700 mb-1">Downtime</p>
              <p className="text-lg font-bold text-red-900">{machine.downtime.toFixed(1)}h</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 mb-1">Eficiență</p>
              <p className="text-lg font-bold text-blue-900">{machine.efficiency}%</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-700 mb-1">Job-uri</p>
              <p className="text-lg font-bold text-orange-900">{machine.jobsCompleted}</p>
            </div>
          </div>

          {machine.maintenanceHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Istoric Mentenanță</p>
              <div className="space-y-2">
                {machine.maintenanceHistory.slice(0, 3).map((maintenance, mIdx) => (
                  <div key={mIdx} className="text-xs text-gray-600 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(maintenance.date).toLocaleDateString('ro-RO')}</span>
                    <span>•</span>
                    <span>{maintenance.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}

      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de mașini...</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
