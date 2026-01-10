/**
 * Reports Dashboard - Main Page
 * Central hub for all reporting modules
 */

'use client';

import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingCart, 
  Factory, 
  DollarSign, 
  PieChart, 
  Settings, 
  Users, 
  UserCheck,
  Download,
  BarChart3,
  LineChart,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ReportCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  metrics?: string;
}

const reports: ReportCard[] = [
  {
    title: 'Rapoarte Vânzări',
    description: 'Analiză completă vânzări, revenue, produse și clienți',
    icon: TrendingUp,
    href: '/dashboard/reports/sales',
    color: 'bg-green-500',
    metrics: 'Revenue, AOV, Growth Rate'
  },
  {
    title: 'Rapoarte Comenzi',
    description: 'Status comenzi, plăți, livrări și întârzieri',
    icon: ShoppingCart,
    href: '/dashboard/reports/orders',
    color: 'bg-blue-500',
    metrics: 'Orders, Status, Delays'
  },
  {
    title: 'Rapoarte Producție',
    description: 'Jobs, timpi, eficiență și bottlenecks producție',
    icon: Factory,
    href: '/dashboard/reports/production',
    color: 'bg-purple-500',
    metrics: 'Jobs, Efficiency, Delays'
  },
  {
    title: 'Rapoarte Costuri',
    description: 'Materiale, tipărire, finisaje și costuri totale',
    icon: DollarSign,
    href: '/dashboard/reports/costs',
    color: 'bg-red-500',
    metrics: 'Materials, Labor, Equipment'
  },
  {
    title: 'Rapoarte Profitabilitate',
    description: 'Profit, marje, profitabilitate pe produs/client',
    icon: PieChart,
    href: '/dashboard/reports/profitability',
    color: 'bg-emerald-500',
    metrics: 'Profit, Margins, ROI'
  },
  {
    title: 'Rapoarte Echipamente',
    description: 'Utilizare, uptime, joburi și performanță echipamente',
    icon: Settings,
    href: '/dashboard/reports/machines',
    color: 'bg-orange-500',
    metrics: 'Utilization, Uptime, Jobs'
  },
  {
    title: 'Rapoarte Operatori',
    description: 'KPI operatori, productivitate și acuratețe',
    icon: UserCheck,
    href: '/dashboard/reports/operators',
    color: 'bg-indigo-500',
    metrics: 'Productivity, Accuracy, KPI'
  },
  {
    title: 'Rapoarte Clienți',
    description: 'Top clienți, LTV, frecvență și preferințe',
    icon: Users,
    href: '/dashboard/reports/customers',
    color: 'bg-pink-500',
    metrics: 'LTV, Frequency, Preferences'
  }
];

const quickActions = [
  {
    title: 'Export Center',
    description: 'Exportă rapoarte în CSV, XLSX sau PDF',
    icon: Download,
    href: '/dashboard/reports/export',
    color: 'bg-cyan-500'
  },
  {
    title: 'Dashboard Analytics',
    description: 'Vizualizări rapide și KPI-uri în timp real',
    icon: BarChart3,
    href: '/dashboard',
    color: 'bg-violet-500'
  }
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Sistem complet de raportare și analiză pentru tipografie
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          <span className="text-sm text-gray-600">Live Data</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rapoarte Disponibile</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <LineChart className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Formate Export</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Download className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Metrici Urmărite</p>
              <p className="text-2xl font-bold text-gray-900">50+</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Update Frecvență</p>
              <p className="text-2xl font-bold text-gray-900">Real-time</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
        </Card>
      </div>

      {/* Main Reports Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📈 Rapoarte Principale
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Link key={report.href} href={report.href}>
                <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${report.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                        <Icon className={`w-6 h-6 ${report.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      {report.description}
                    </p>

                    {report.metrics && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">
                          {report.metrics}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ⚡ Acțiuni Rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-lg ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                      <Icon className={`w-8 h-8 ${action.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features List */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ✨ Caracteristici Sistem Rapoarte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-gray-900">Filtre Avansate</p>
              <p className="text-sm text-gray-600">Dată, categorie, produs, client</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-gray-900">Grafice Interactive</p>
              <p className="text-sm text-gray-600">Line, Bar, Pie charts</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-gray-900">Export Multi-Format</p>
              <p className="text-sm text-gray-600">CSV, XLSX, PDF</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-gray-900">Date în Timp Real</p>
              <p className="text-sm text-gray-600">Live updates și refresh</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-gray-900">Responsive Design</p>
              <p className="text-sm text-gray-600">Desktop, tablet, mobil</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-gray-900">Performanță Optimizată</p>
              <p className="text-sm text-gray-600">Fast rendering și caching</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ghid Rapid
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Selectează tipul de raport dorit din grid-ul de mai sus</li>
              <li>• Aplică filtre (dată, categorie, etc.) pentru date specifice</li>
              <li>• Analizează graficele și tabelele interactive</li>
              <li>• Exportă rapoartele în format CSV, XLSX sau PDF</li>
              <li>• Revino la Dashboard pentru overview rapid</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
