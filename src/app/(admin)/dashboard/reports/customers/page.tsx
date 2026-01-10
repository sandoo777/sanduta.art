/**
 * Customers Reports Page
 * Customer analysis, LTV, frequency, and preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { Users, Heart, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';
import { Card } from '@/components/ui/Card';
import { useReports, type CustomersReport } from '@/modules/admin/useReports';
import { useExports } from '@/modules/admin/useExports';

export default function CustomersReportsPage() {
  const { fetchCustomersReport, loading } = useReports();
  const { exportCustomers } = useExports();
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [report, setReport] = useState<CustomersReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      const data = await fetchCustomersReport({ dateRange });
      setReport(data);
    } catch (error) {
      console.error('Failed to load customers report:', error);
    }
  };

  const handleExport = async () => {
    await exportCustomers('xlsx', dateRange);
  };

  return (
    <ReportLayout
      title="Rapoarte Clienți"
      description="Analiza clienți: LTV, frecvență, preferințe"
      icon={<Users className="w-6 h-6 text-pink-600" />}
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
            title="Total Clienți"
            value={report.metrics.totalCustomers}
            icon={<Users className="w-5 h-5" />}
            color="pink"
          />
          <MetricCard
            title="LTV Mediu"
            value={`${report.metrics.averageLTV.toLocaleString('ro-RO')} RON`}
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Frecvență Medie"
            value={`${report.metrics.averageFrequency.toFixed(1)} comenzi`}
            icon={<ShoppingBag className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Rată Retenție"
            value={`${report.metrics.retentionRate}%`}
            icon={<Heart className="w-5 h-5" />}
            color="red"
          />
        </div>
      )}

      {/* Customer Segments */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Segmente Clienți
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.segments.map((segment, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    segment.name === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                    segment.name === 'Regular' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {segment.percentage}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600">Clienți</p>
                    <p className="font-bold text-gray-900">{segment.customerCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">LTV Mediu</p>
                    <p className="font-bold text-gray-900">{segment.averageLTV.toLocaleString('ro-RO')} RON</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Customers */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⭐ Top Clienți (LTV)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">LTV</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Comenzi</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Frecvență</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ultima Comandă</th>
                </tr>
              </thead>
              <tbody>
                {report.topCustomers.map((customer, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-600">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {customer.lifetimeValue.toLocaleString('ro-RO')} RON
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{customer.ordersCount}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {customer.orderFrequency.toFixed(1)} zile
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(customer.lastOrderDate).toLocaleDateString('ro-RO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Product Preferences */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💝 Preferințe Produse
            </h3>
            <div className="space-y-3">
              {report.productPreferences.map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{pref.productName}</p>
                    <p className="text-sm text-gray-600">{pref.orderCount} comenzi</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{pref.percentage}%</p>
                    <p className="text-xs text-gray-600">din clienți</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📅 Comportament Cumpărare
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Frecvență Medie</p>
                <p className="text-2xl font-bold text-blue-900">
                  {report.purchaseBehavior.averageFrequency.toFixed(1)} zile
                </p>
                <p className="text-xs text-blue-600 mt-1">între comenzi</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Valoare Medie Comandă</p>
                <p className="text-2xl font-bold text-green-900">
                  {report.purchaseBehavior.averageOrderValue.toLocaleString('ro-RO')} RON
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Ora Preferată</p>
                <p className="text-2xl font-bold text-purple-900">
                  {report.purchaseBehavior.preferredTimeSlot}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Customer Growth Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Creștere Bază Clienți
        </h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
          <p className="text-gray-600">
            {loading ? 'Se încarcă graficul...' : 'Grafic Area Chart - Integrare Recharts'}
          </p>
        </div>
      </Card>

      {loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Se încarcă raportul de clienți...</p>
          </div>
        </Card>
      )}

      {!loading && !report && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nu există date clienți pentru perioada selectată</p>
          </div>
        </Card>
      )}
    </ReportLayout>
  );
}
