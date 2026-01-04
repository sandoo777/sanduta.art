"use client";

import { LucideIcon } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "amber" | "red" | "purple" | "pink";
  subtitle?: string;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    trend: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    trend: "text-green-600",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    trend: "text-amber-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    trend: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    trend: "text-purple-600",
  },
  pink: {
    bg: "bg-pink-50",
    icon: "text-pink-600",
    trend: "text-pink-600",
  },
};

export function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "blue",
  subtitle
}: KpiCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? "text-green-600" : "text-red-600"
          }`}>
            {trend.isPositive ? (
              <ArrowUpIcon className="w-4 h-4" />
            ) : (
              <ArrowDownIcon className="w-4 h-4" />
            )}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
