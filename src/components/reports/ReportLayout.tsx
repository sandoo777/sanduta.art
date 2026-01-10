/**
 * Report Layout Component
 * Reusable layout for all report pages
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ReportLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onExport?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function ReportLayout({
  title,
  description,
  icon,
  children,
  onExport,
  onRefresh,
  loading = false
}: ReportLayoutProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="secondary" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

// Date Range Picker Component
interface DateRangePickerProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            De la
          </label>
          <input
            type="date"
            value={from.toISOString().split('T')[0]}
            onChange={(e) => onChange(new Date(e.target.value), to)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Până la
          </label>
          <input
            type="date"
            value={to.toISOString().split('T')[0]}
            onChange={(e) => onChange(from, new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastWeek = new Date(today);
              lastWeek.setDate(today.getDate() - 7);
              onChange(lastWeek, today);
            }}
          >
            7 zile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(today);
              lastMonth.setMonth(today.getMonth() - 1);
              onChange(lastMonth, today);
            }}
          >
            30 zile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date();
              const startOfYear = new Date(today.getFullYear(), 0, 1);
              onChange(startOfYear, today);
            }}
          >
            Anul acesta
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  color?: string;
}

export function MetricCard({ title, value, change, icon, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
