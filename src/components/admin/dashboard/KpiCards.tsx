"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Factory, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Settings 
} from "lucide-react";
import { useAnalytics } from "@/modules/admin/useAnalytics";

interface KPI {
  id: string;
  label: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function KpiCards() {
  const { fetchKpis, loading } = useAnalytics();
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    loadKpis();
    // Revalidare la 60 secunde
    const interval = setInterval(loadKpis, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadKpis = async () => {
    const data = await fetchKpis();
    if (data) {
      setKpis([
        {
          id: "sales",
          label: "Vânzări Astăzi",
          value: `${data.salesToday.toLocaleString()} RON`,
          change: data.salesChange,
          changeType: data.salesChange >= 0 ? "increase" : "decrease",
          icon: <DollarSign className="w-6 h-6" />,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
        },
        {
          id: "orders",
          label: "Comenzi",
          value: data.ordersToday,
          change: data.ordersChange,
          changeType: data.ordersChange >= 0 ? "increase" : "decrease",
          icon: <ShoppingCart className="w-6 h-6" />,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
        },
        {
          id: "production",
          label: "În Producție",
          value: data.inProduction,
          change: data.productionChange,
          changeType: "neutral",
          icon: <Factory className="w-6 h-6" />,
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
        },
        {
          id: "profit",
          label: "Profit Estimat",
          value: `${data.estimatedProfit.toLocaleString()} RON`,
          change: data.profitChange,
          changeType: data.profitChange >= 0 ? "increase" : "decrease",
          icon: <TrendingUp className="w-6 h-6" />,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
        },
        {
          id: "avgTime",
          label: "Timp Mediu Producție",
          value: `${data.avgProductionTime}h`,
          change: data.timeChange,
          changeType: data.timeChange <= 0 ? "increase" : "decrease",
          icon: <Clock className="w-6 h-6" />,
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
        },
        {
          id: "onTime",
          label: "Rată Finalizare la Timp",
          value: `${data.onTimeRate}%`,
          change: data.onTimeChange,
          changeType: data.onTimeChange >= 0 ? "increase" : "decrease",
          icon: <CheckCircle className="w-6 h-6" />,
          iconBg: "bg-teal-100",
          iconColor: "text-teal-600",
        },
        {
          id: "utilization",
          label: "Utilizare Echipamente",
          value: `${data.equipmentUtilization}%`,
          change: data.utilizationChange,
          changeType: data.utilizationChange >= 0 ? "increase" : "decrease",
          icon: <Settings className="w-6 h-6" />,
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
        },
      ]);
    }
  };

  if (loading && kpis.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-6 shadow-sm">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Icon */}
          <div className={`${kpi.iconBg} ${kpi.iconColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
            {kpi.icon}
          </div>

          {/* Label */}
          <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>

          {/* Value */}
          <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>

          {/* Change */}
          {kpi.change !== 0 && (
            <div className="flex items-center gap-1">
              {kpi.changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : kpi.changeType === "decrease" ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  kpi.changeType === "increase"
                    ? "text-green-600"
                    : kpi.changeType === "decrease"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {kpi.change > 0 ? "+" : ""}
                {kpi.change}%
              </span>
              <span className="text-xs text-gray-500">vs. ieri</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
