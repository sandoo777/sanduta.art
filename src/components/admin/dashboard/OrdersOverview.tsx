"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useAnalytics } from "@/modules/admin/useAnalytics";

interface OrderStats {
  status: string;
  count: number;
  percentage: number;
  color: string;
  label: string;
}

export default function OrdersOverview() {
  const { fetchOrdersStats, loading } = useAnalytics();
  const [stats, setStats] = useState<OrderStats[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const data = await fetchOrdersStats();
    if (data) {
      // Transform data to add color and label
      const statusColors: Record<string, string> = {
        PENDING: "#fbbf24",
        IN_PREPRODUCTION: "#a78bfa",
        IN_DESIGN: "#f97316",
        IN_PRODUCTION: "#3b82f6",
        IN_PRINTING: "#06b6d4",
        QUALITY_CHECK: "#8b5cf6",
        READY_FOR_DELIVERY: "#10b981",
        DELIVERED: "#22c55e",
        CANCELLED: "#ef4444",
      };
      
      const statusLabels: Record<string, string> = {
        PENDING: "În așteptare",
        IN_PREPRODUCTION: "Preproducție",
        IN_DESIGN: "Design",
        IN_PRODUCTION: "Producție",
        IN_PRINTING: "Printare",
        QUALITY_CHECK: "Control Calitate",
        READY_FOR_DELIVERY: "Gata livrare",
        DELIVERED: "Livrate",
        CANCELLED: "Anulate",
      };
      
      const transformed = data.map(item => ({
        ...item,
        color: statusColors[item.status] || "#9ca3af",
        label: statusLabels[item.status] || item.status,
      }));
      
      setStats(transformed);
      setTotal(data.reduce((sum, item) => sum + item.count, 0));
    }
  };

  if (loading && stats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Comenzi</h2>
          <p className="text-sm text-gray-600">Total: {total} comenzi</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="20"
          />

          {/* Donut segments */}
          {stats.map((stat, index) => {
            const previousPercentage = stats
              .slice(0, index)
              .reduce((acc, s) => acc + s.percentage, 0);
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (circumference * previousPercentage) / 100;
            const dashArray = `${(circumference * stat.percentage) / 100} ${circumference}`;

            return (
              <circle
                key={stat.status}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={stat.color}
                strokeWidth="20"
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
                style={{ transformOrigin: "50% 50%" }}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{total}</span>
          <span className="text-sm text-gray-600">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.status} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stat.color }}
              ></div>
              <span className="text-sm text-gray-700">{stat.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">
                {stat.count}
              </span>
              <span className="text-sm text-gray-500 min-w-[3rem] text-right">
                {stat.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
