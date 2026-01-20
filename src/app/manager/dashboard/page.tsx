'use client';

import { ShoppingCart, Package, DollarSign, TrendingUp, Factory, Clock } from 'lucide-react';
import { KpiCard } from './_components/KpiCard';
import { SalesChart } from './_components/SalesChart';
import { TopProducts } from './_components/TopProducts';
import { ProductionOverview } from './_components/ProductionOverview';
import Link from 'next/link';

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-2">Production & operations overview</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/manager/orders"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            View Orders
          </Link>
          <Link 
            href="/manager/production"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Production
          </Link>
        </div>
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
          title="In Production"
          value={37}
          icon={<Factory className="w-6 h-6" />}
          trend="5 delayed"
          trendUp={false}
          color="blue"
        />
        <KpiCard
          title="Avg Production Time"
          value="18.5h"
          icon={<Clock className="w-6 h-6" />}
          trend="-5% vs yesterday"
          trendUp={true}
          color="green"
        />
        <KpiCard
          title="On-Time Delivery"
          value="94%"
          icon={<TrendingUp className="w-6 h-6" />}
          trend="+2% this week"
          trendUp={true}
          color="orange"
        />
      </div>

      {/* Production Overview */}
      <ProductionOverview />

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <TopProducts />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/manager/orders"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Orders</p>
              <p className="text-xs text-gray-500">View and process orders</p>
            </div>
          </Link>

          <Link 
            href="/manager/production"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Factory className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Production</p>
              <p className="text-xs text-gray-500">Track production status</p>
            </div>
          </Link>

          <Link 
            href="/manager/reports"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Reports</p>
              <p className="text-xs text-gray-500">View analytics & reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
