"use client";

import { useEffect, useState } from "react";
import { Factory, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useAnalytics, ProductionStats as AnalyticsProductionStats } from "@/modules/admin/useAnalytics";

interface ProductionStats {
  activeJobs: number;
  delayedJobs: number;
  completedToday: number;
  queuedJobs: number;
  throughput: number[];
  labels: string[];
}

export default function ProductionOverview() {
  const { fetchProductionStats, loading } = useAnalytics();
  const [stats, setStats] = useState<ProductionStats | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const data = await fetchProductionStats();
    if (data) {
      // Transform AnalyticsProductionStats to ProductionStats
      const transformed: ProductionStats = {
        activeJobs: data.active,
        delayedJobs: data.delayed,
        completedToday: data.completedToday,
        queuedJobs: data.queued,
        throughput: data.throughput.map(item => item.count),
        labels: data.throughput.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
        }),
      };
      setStats(transformed);
    }
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxThroughput = Math.max(...stats.throughput);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center">
          <Factory className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Producție</h2>
          <p className="text-sm text-gray-600">Status operațiuni</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Active Jobs */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
        </div>

        {/* Delayed Jobs */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600">Întârziate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.delayedJobs}</p>
        </div>

        {/* Completed Today */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Finalizate azi</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
        </div>

        {/* Queued Jobs */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Factory className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">În coadă</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.queuedJobs}</p>
        </div>
      </div>

      {/* Throughput Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Throughput Producție (ultimele 7 zile)
        </h3>
        <div className="h-32 flex items-end justify-between gap-2">
          {stats.throughput.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full bg-gray-100 rounded-t overflow-hidden">
                <div
                  className="bg-blue-500 rounded-t transition-all duration-500"
                  style={{
                    height: `${(value / maxThroughput) * 100}px`,
                  }}
                  title={`${value} joburi`}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{stats.labels[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
