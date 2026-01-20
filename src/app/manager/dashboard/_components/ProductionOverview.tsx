"use client";

import { useEffect, useState } from "react";
import { Factory, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface ProductionStats {
  activeJobs: number;
  delayedJobs: number;
  completedToday: number;
  queuedJobs: number;
  throughput: number[];
  labels: string[];
}

export function ProductionOverview() {
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics/production');
      if (response.ok) {
        const data = await response.json();
        const transformed: ProductionStats = {
          activeJobs: data.active,
          delayedJobs: data.delayed,
          completedToday: data.completedToday,
          queuedJobs: data.queued,
          throughput: data.throughput.map((item: { count: number }) => item.count),
          labels: data.throughput.map((item: { date: string }) => {
            const date = new Date(item.date);
            return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
          }),
        };
        setStats(transformed);
      }
    } catch (error) {
      console.error('Error loading production stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxThroughput = Math.max(...stats.throughput, 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Production Overview</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <span className="text-sm text-gray-600">Delayed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.delayedJobs}</p>
        </div>

        {/* Completed Today */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
        </div>

        {/* Queued Jobs */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Factory className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Queued</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.queuedJobs}</p>
        </div>
      </div>

      {/* Throughput Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Production Throughput (Last 7 Days)
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
                  title={`${value} jobs`}
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
