/**
 * Orders Reports Page
 * Order tracking, status analysis, and delivery performance
 */

'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useReports, type OrdersReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function OrdersReportsPage() {
  const { fetchOrdersReport, loading } = useReports();
  const { exportOrders } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<OrdersReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchOrdersReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load orders report:', error);
    }
  };

  const handleExport = async () => {
    await exportOrders('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Comenzi"
      description="Monitorizare comenzi, status și performanță livrare"
      icon={<ShoppingCart className="w-6 h-6 text-green-600" />}
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
            title="Total Comenzi"
            value={report.metrics.totalOrders}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Timp Procesare Mediu"
            value={`${report.metrics.averageProcessingTime.toFixed(1)} ore`}
            icon={<Clock className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Rată Finalizare"
            value={`${report.metrics.completionRate}%`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Comenzi Întârziate"
            value={report.metrics.delayedOrders}
            icon={<AlertCircle className="w-5 h-5" />}
            color="red"
          />
        </div>
      )}

      {/* Order Status Distribution */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Distribuție pe Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {report.byStatus.map((status, idx) => (
              <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <StatusBadge status={status.status} className="mb-2" />
                <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                <p className="text-sm text-gray-600 mt-1">{status.percentage}% din total</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment & Delivery Analysis */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💳 Status Plăți
            </h3>
            <div className="space-y-3">
              {report.paymentAnalysis.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {payment.status === 'PAID' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {payment.status === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
                    {payment.status === 'FAILED' && <XCircle className="w-5 h-5 text-red-600" />}
                    <div>
                      <p className="font-medium text-gray-900">{payment.status}</p>
                      <p className="text-sm text-gray-600">{payment.count} comenzi</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {payment.totalAmount.toLocaleString('ro-RO')} RON
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Methods */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚚 Metode Livrare
            </h3>
            <div className="space-y-3">
              {report.deliveryAnalysis.map((delivery, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{delivery.method}</p>
                      <p className="text-sm text-gray-600">{delivery.count} comenzi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{delivery.percentage}%</p>
                    <p className="text-sm text-gray-600">{delivery.averageDeliveryTime.toFixed(1)}h livrare</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Delayed Orders Table */}
      {report && report.delayedOrders.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Comenzi Întârziate
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID Comandă</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Întârziere</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Motiv</th>
                </tr>
              </thead>
              <tbody>
                {report.delayedOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-blue-600">#{order.orderId}</td>
                    <td className="py-3 px-4 text-gray-900">{order.customerName}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-red-600 font-semibold">{order.delayDays} zile</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.delayReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Orders Timeline Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📅 Comenzi pe Timeline
        </h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
          <p className="text-gray-600">
            {loading ? 'Se încarcă graficul...' : 'Grafic Bar Chart - Integrare Recharts'}
          </p>
        </div>
      </Card>

      {/* Loading State */}
      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de comenzi...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nu există comenzi pentru perioada selectată</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
