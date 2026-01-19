'use client';

import { ShoppingCart, Package, DollarSign, Users } from 'lucide-react';
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
          icon={<ShoppingCart className="w-6 h-6" />}
          trend="+12% this month"
          trendUp={true}
          color="purple"
        />
        <KpiCard
          title="Orders In Production"
          value={37}
          icon={<Package className="w-6 h-6" />}
          trend="5 pending review"
          trendUp={false}
          color="blue"
        />
        <KpiCard
          title="Total Revenue"
          value="52,430 MDL"
          icon={<DollarSign className="w-6 h-6" />}
          trend="+18% this month"
          trendUp={true}
          color="green"
        />
        <KpiCard
          title="New Customers"
          value={14}
          icon={<Users className="w-6 h-6" />}
          trend="+3 this week"
          trendUp={true}
          color="orange"
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
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
      </div>
    </div>
  );
}
