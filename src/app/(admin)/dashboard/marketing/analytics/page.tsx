/**
 * Marketing Analytics Page
 */

'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Mail, Tag, Users, DollarSign, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMarketing, MarketingAnalytics } from '@/modules/admin/useMarketing';

export default function AnalyticsPage() {
  const { fetchMarketingAnalytics, loading } = useMarketing();
  const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    const data = await fetchMarketingAnalytics(dateRange.start, dateRange.end);
    setAnalytics(data);
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Se încarcă analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Analytics</h1>
          <p className="mt-2 text-gray-600">Analizează performanța campaniilor și ROI</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <Button variant="primary" onClick={loadAnalytics}>Actualizează</Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Venit Marketing</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics.overview.marketingRevenue.toLocaleString('ro-RO')} lei
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Marketing</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {analytics.overview.roi.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversii</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics.overview.conversions}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics.overview.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Coupons Performance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performanță Cupoane</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cod</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Utilizări</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Venit</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reducere</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {analytics.coupons.map((coupon) => (
                <tr key={coupon.couponId}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono">{coupon.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{coupon.uses}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    {coupon.revenue.toLocaleString('ro-RO')} lei
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    -{coupon.discount.toLocaleString('ro-RO')} lei
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {coupon.roi.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Email Performance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performanță Email</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nume</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trimise</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Open Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Click Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Conversii</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {analytics.emails.map((email) => (
                <tr key={email.automationId}>
                  <td className="px-6 py-4 whitespace-nowrap">{email.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{email.sent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{email.openRate.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">{email.clickRate.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    {email.converted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
