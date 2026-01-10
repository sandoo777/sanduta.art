import { useState } from "react";
import { logger } from "@/lib/logger";

// Types
export interface KPI {
  salesToday: number;
  salesChange: number;
  ordersToday: number;
  ordersChange: number;
  inProduction: number;
  productionChange: number;
  estimatedProfit: number;
  profitChange: number;
  avgProductionTime: number;
  timeChange: number;
  onTimeRate: number;
  onTimeChange: number;
  equipmentUtilization: number;
  utilizationChange: number;
}

export interface DataPoint {
  date: string;
  value: number;
  compareValue?: number;
}

export interface OrderStats {
  status: string;
  count: number;
  percentage: number;
}

export interface ProductionStats {
  active: number;
  delayed: number;
  completedToday: number;
  queued: number;
  throughput: Array<{ date: string; count: number }>;
}

export interface MachineUtilization {
  id: string;
  name: string;
  status: "active" | "idle" | "maintenance";
  utilization: number;
  activeTime: number;
  idleTime: number;
}

export interface OperatorPerf {
  id: string;
  name: string;
  jobsCompleted: number;
  avgTime: number;
  accuracy: number;
  errors: number;
  kpiScore: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  category: "file" | "order" | "machine" | "operation";
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T,>(
    url: string,
    options?: RequestInit
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logger.error("useAnalytics", "Request failed", { url, error: errorMsg });
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch KPIs
  const fetchKpis = async (): Promise<KPI | null> => {
    return handleRequest<KPI>("/api/admin/analytics/kpis");
  };

  // Fetch Sales Data
  const fetchSalesData = async (
    period: "day" | "week" | "month" | "year",
    compare: boolean = false
  ): Promise<DataPoint[] | null> => {
    const params = new URLSearchParams({ period, compare: String(compare) });
    return handleRequest<DataPoint[]>(`/api/admin/analytics/sales?${params}`);
  };

  // Fetch Orders Stats
  const fetchOrdersStats = async (): Promise<OrderStats[] | null> => {
    return handleRequest<OrderStats[]>("/api/admin/analytics/orders");
  };

  // Fetch Production Stats
  const fetchProductionStats = async (): Promise<ProductionStats | null> => {
    return handleRequest<ProductionStats>("/api/admin/analytics/production");
  };

  // Fetch Machines Utilization
  const fetchMachinesUtilization = async (): Promise<MachineUtilization[] | null> => {
    return handleRequest<MachineUtilization[]>("/api/admin/analytics/machines");
  };

  // Fetch Operator Performance
  const fetchOperatorPerformance = async (): Promise<OperatorPerf[] | null> => {
    return handleRequest<OperatorPerf[]>("/api/admin/analytics/operators");
  };

  // Fetch Recent Orders
  const fetchRecentOrders = async (limit: number = 10): Promise<RecentOrder[] | null> => {
    return handleRequest<RecentOrder[]>(`/api/admin/analytics/recent-orders?limit=${limit}`);
  };

  // Fetch Alerts
  const fetchAlerts = async (): Promise<Alert[] | null> => {
    return handleRequest<Alert[]>("/api/admin/analytics/alerts");
  };

  return {
    loading,
    error,
    fetchKpis,
    fetchSalesData,
    fetchOrdersStats,
    fetchProductionStats,
    fetchMachinesUtilization,
    fetchOperatorPerformance,
    fetchRecentOrders,
    fetchAlerts,
  };
}
