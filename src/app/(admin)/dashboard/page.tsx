"use client";

import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";
import KpiCards from "@/components/admin/dashboard/KpiCards";
import SalesChart from "@/components/admin/dashboard/SalesChart";
import OrdersOverview from "@/components/admin/dashboard/OrdersOverview";
import ProductionOverview from "@/components/admin/dashboard/ProductionOverview";
import MachinesUtilization from "@/components/admin/dashboard/MachinesUtilization";
import OperatorPerformance from "@/components/admin/dashboard/OperatorPerformance";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import AlertsPanel from "@/components/admin/dashboard/AlertsPanel";

// Loading skeleton pentru componente
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-600 text-lg">Overview & Analytics</p>
      </div>

      {/* KPI Cards - Always on top */}
      <section className="mb-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <KpiCards />
        </Suspense>
      </section>

      {/* Alerts Panel - Critical info */}
      <section className="mb-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <AlertsPanel />
        </Suspense>
      </section>

      {/* Main Content Grid - Desktop: 2 columns, Tablet: 2 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <section className="lg:col-span-2">
          <Suspense fallback={<LoadingSkeleton />}>
            <SalesChart />
          </Suspense>
        </section>

        {/* Orders Overview */}
        <section>
          <Suspense fallback={<LoadingSkeleton />}>
            <OrdersOverview />
          </Suspense>
        </section>

        {/* Production Overview */}
        <section>
          <Suspense fallback={<LoadingSkeleton />}>
            <ProductionOverview />
          </Suspense>
        </section>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Machines Utilization */}
        <section className="lg:col-span-2">
          <Suspense fallback={<LoadingSkeleton />}>
            <MachinesUtilization />
          </Suspense>
        </section>

        {/* Operator Performance */}
        <section>
          <Suspense fallback={<LoadingSkeleton />}>
            <OperatorPerformance />
          </Suspense>
        </section>
      </div>

      {/* Recent Orders - Full width */}
      <section className="mb-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <RecentOrders />
        </Suspense>
      </section>
    </div>
  );
}
