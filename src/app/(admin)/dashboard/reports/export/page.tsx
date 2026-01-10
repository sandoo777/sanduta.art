/**
 * Export Center Page
 * Centralized export management for all reports
 */

'use client';

import { useState } from 'react';
import { Download, FileText, Table, File, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useExports } from '@/modules/admin/useExports';
import Link from 'next/link';

type ReportType = 'sales' | 'orders' | 'production' | 'costs' | 'profitability' | 'machines' | 'operators' | 'customers';
type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface ExportHistoryItem {
  id: string;
  reportType: string;
  format: string;
  date: Date;
  status: 'completed' | 'failed';
  fileName: string;
}

export default function ExportCenterPage() {
  const {
    exportSales,
    exportOrders,
    exportProduction,
    exportCosts,
    exportProfitability,
    exportMachines,
    exportOperators,
    exportCustomers,
    loading
  } = useExports();

  const [selectedReport, setSelectedReport] = useState<ReportType>('sales');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  // Mock export history - în producție vine din API/localStorage
  const [exportHistory] = useState<ExportHistoryItem[]>([
    {
      id: '1',
      reportType: 'Sales',
      format: 'xlsx',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
      fileName: 'sales_report_2026-01-10.xlsx'
    },
    {
      id: '2',
      reportType: 'Orders',
      format: 'pdf',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'completed',
      fileName: 'orders_report_2026-01-09.pdf'
    }
  ]);

  const reports: { value: ReportType; label: string; description: string; icon: any }[] = [
    { value: 'sales', label: 'Vânzări', description: 'Revenue, produse, categorii', icon: '💰' },
    { value: 'orders', label: 'Comenzi', description: 'Status, plăți, livrări', icon: '📦' },
    { value: 'production', label: 'Producție', description: 'Eficiență, job-uri, bottleneck-uri', icon: '🏭' },
    { value: 'costs', label: 'Costuri', description: 'Materiale, manoperă, echipamente', icon: '💸' },
    { value: 'profitability', label: 'Profitabilitate', description: 'Marje, profit, ROI', icon: '📈' },
    { value: 'machines', label: 'Mașini', description: 'Utilizare, uptime, performanță', icon: '⚙️' },
    { value: 'operators', label: 'Operatori', description: 'KPIs, productivitate', icon: '👷' },
    { value: 'customers', label: 'Clienți', description: 'LTV, frecvență, preferințe', icon: '👥' }
  ];

  const formats: { value: ExportFormat; label: string; icon: any }[] = [
    { value: 'csv', label: 'CSV', icon: <Table className="w-5 h-5" /> },
    { value: 'xlsx', label: 'Excel', icon: <FileText className="w-5 h-5" /> },
    { value: 'pdf', label: 'PDF', icon: <File className="w-5 h-5" /> }
  ];

  const handleExport = async () => {
    try {
      switch (selectedReport) {
        case 'sales':
          await exportSales(selectedFormat, dateRange);
          break;
        case 'orders':
          await exportOrders(selectedFormat, dateRange);
          break;
        case 'production':
          await exportProduction(selectedFormat, dateRange);
          break;
        case 'costs':
          await exportCosts(selectedFormat, dateRange);
          break;
        case 'profitability':
          await exportProfitability(selectedFormat, dateRange);
          break;
        case 'machines':
          await exportMachines(selectedFormat, dateRange);
          break;
        case 'operators':
          await exportOperators(selectedFormat, dateRange);
          break;
        case 'customers':
          await exportCustomers(selectedFormat, dateRange);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Export Center</h1>
              <p className="text-gray-600">Exportă rapoarte în format CSV, Excel sau PDF</p>
            </div>
          </div>
          <Link href="/dashboard/reports">
            <Button variant="secondary">
              ← Înapoi la Rapoarte
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Export Configuration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            🎯 Configurare Export
          </h2>

          {/* Step 1: Select Report */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              1. Selectează Raport
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {reports.map((report) => (
                <button
                  key={report.value}
                  onClick={() => setSelectedReport(report.value)}
                  className={`p-4 text-left rounded-lg border-2 transition ${
                    selectedReport === report.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{report.icon}</div>
                  <p className="font-semibold text-gray-900 text-sm">{report.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Format */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              2. Selectează Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`p-4 rounded-lg border-2 transition flex items-center justify-center gap-3 ${
                    selectedFormat === format.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {format.icon}
                  <span className="font-semibold text-gray-900">{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Select Date Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              3. Selectează Perioadă
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">De la</label>
                <input
                  type="date"
                  value={dateRange.from.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Până la</label>
                <input
                  type="date"
                  value={dateRange.to.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Se exportă...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportă {reports.find(r => r.value === selectedReport)?.label} ({selectedFormat.toUpperCase()})
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Export History */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Istoric Exporturi
          </h2>
          
          {exportHistory.length > 0 ? (
            <div className="space-y-2">
              {exportHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.fileName}</p>
                      <p className="text-sm text-gray-600">
                        {item.reportType} • {item.format.toUpperCase()} • {new Date(item.date).toLocaleString('ro-RO')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              Niciun export în istoric
            </div>
          )}
        </Card>

        {/* Quick Tips */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips pentru Export</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>CSV:</strong> Perfect pentru import în alte sisteme sau procesare cu Excel</li>
            <li>• <strong>Excel:</strong> Include formatare, formule și multiple sheets</li>
            <li>• <strong>PDF:</strong> Ideal pentru prezentări și arhivare</li>
            <li>• Exporturile sunt salvate local pe calculatorul tău</li>
            <li>• Poți exporta date pentru orice perioadă dorești</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
