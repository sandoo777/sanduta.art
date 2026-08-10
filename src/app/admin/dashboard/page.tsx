'use client';

import { ShoppingCart, Package, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KpiCard } from './_components/KpiCard';
import { SalesChart } from './_components/SalesChart';
import { TopProducts } from './_components/TopProducts';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here&apos;s your business overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          title="Total Orders"
          value={128}
          icon={ShoppingCart}
          trend="+12% this month"
          trendUp={true}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <KpiCard
          title="Orders In Production"
          value={37}
          icon={Package}
          trend="5 pending review"
          trendUp={false}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Total Revenue"
          value="52,430 MDL"
          icon={DollarSign}
          trend="+18% this month"
          trendUp={true}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <KpiCard
          title="New Customers"
          value={14}
          icon={Users}
          trend="+3 this week"
          trendUp={true}
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <TopProducts />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          <div className="flex items-center border-b pb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-green-600 text-lg">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Order #1234 completed</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center border-b pb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 text-lg">📦</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New order received</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <span className="text-purple-600 text-lg">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New customer registered</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
