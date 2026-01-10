/**
 * Reports Engine Module
 * 
 * Comprehensive reporting system for sanduta.art print shop:
 * - Sales reports (revenue, products, categories, trends)
 * - Orders reports (status, payments, delivery, fulfillment)
 * - Production reports (jobs, machines, operators, efficiency)
 * - Cost reports (materials, labor, equipment, overhead)
 * - Profitability reports (margins, profit per product/order/customer)
 * - Machines reports (utilization, uptime, operations)
 * - Operators reports (productivity, KPIs, performance)
 * - Customers reports (top customers, LTV, frequency, preferences)
 */

'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ReportFilters {
  dateRange: DateRange;
  category?: string;
  productId?: string;
  customerId?: string;
  status?: string;
  machineId?: string;
  operatorId?: string;
}

// Sales Reports
export interface SalesMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  growthRate: number;
}

export interface SalesByPeriod {
  date: string;
  revenue: number;
  orders: number;
}

export interface SalesByCategory {
  category: string;
  revenue: number;
  percentage: number;
  orders: number;
}

export interface SalesByProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  averagePrice: number;
}

export interface SalesReport {
  metrics: SalesMetrics;
  byPeriod: SalesByPeriod[];
  byCategory: SalesByCategory[];
  byProduct: SalesByProduct[];
  topCustomers: CustomerSales[];
}

export interface CustomerSales {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  ordersCount: number;
}

// Orders Reports
export interface OrdersMetrics {
  totalOrders: number;
  pending: number;
  inProduction: number;
  completed: number;
  cancelled: number;
  delayedOrders: number;
  averageCompletionTime: number; // in hours
  averageProcessingTime: number; // in hours
  completionRate: number; // percentage
}

export interface OrdersByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface OrdersByPaymentMethod {
  method: string;
  count: number;
  totalAmount: number;
}

export interface PaymentAnalysis {
  status: string;
  count: number;
  totalAmount: number;
}

export interface DeliveryAnalysis {
  method: string;
  count: number;
  percentage: number;
  averageDeliveryTime: number;
}

export interface OrdersReport {
  metrics: OrdersMetrics;
  byStatus: OrdersByStatus[];
  byPaymentMethod: OrdersByPaymentMethod[];
  byDeliveryMethod: OrdersByStatus[];
  paymentAnalysis: PaymentAnalysis[];
  deliveryAnalysis: DeliveryAnalysis[];
  delayedOrders: DelayedOrder[];
}

export interface DelayedOrder {
  orderId: string;
  customerName: string;
  daysDelayed: number;
  delayDays: number;
  delayReason: string;
  status: string;
  estimatedDelivery: Date;
}

// Production Reports
export interface ProductionMetrics {
  totalJobs: number;
  completedJobs: number;
  delayedJobs: number;
  averageActualTime: number;
  averageEstimatedTime: number;
  averageProductionTime: number;
  efficiency: number; // percentage
  productionEfficiency: number; // percentage
  efficiencyTrend: number; // change percentage
  jobsPerDay: number;
}

export interface ProductionByMachine {
  machineId: string;
  machineName: string;
  jobsCompleted: number;
  totalTime: number;
  utilizationRate: number;
  efficiency: number;
}

export interface ProductionByOperator {
  operatorId: string;
  operatorName: string;
  jobsCompleted: number;
  averageTime: number;
  workHours: number;
  jobsPerHour: number;
  productivityRate: number;
  accuracyRate: number;
}

export interface ProductionBottleneck {
  stage: string;
  description: string;
  averageDelay: number;
  jobsAffected: number;
  affectedJobs: number;
  impact: number;
  recommendation: string;
}

export interface ProductionByStatus {
  status: string;
  count: number;
  percentage: number;
  averageTime: number;
}

export interface ProductionReport {
  metrics: ProductionMetrics;
  byStatus: ProductionByStatus[];
  byMachine: ProductionByMachine[];
  byOperator: ProductionByOperator[];
  bottlenecks: ProductionBottleneck[];
  actualVsEstimated: { actual: number; estimated: number; date: string }[];
}

// Cost Reports
export interface CostMetrics {
  totalCosts: number;
  materialCosts: number;
  materialsCost: number;
  laborCosts: number;
  equipmentCosts: number;
  printingCost: number;
  finishingCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  costTrend: number;
}

export interface CostByOrder {
  orderId: string;
  customerName: string;
  totalCost: number;
  breakdown: {
    materials: number;
    printing: number;
    finishing: number;
    labor: number;
  };
}

export interface CostByProduct {
  productId: string;
  productName: string;
  averageCost: number;
  totalCost: number;
  unitsProduced: number;
}

export interface CostByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface TopMaterial {
  materialName: string;
  quantity: number;
  totalCost: number;
}

export interface LaborByOperator {
  operatorName: string;
  hoursWorked: number;
  totalCost: number;
}

export interface CostReport {
  metrics: CostMetrics;
  byCategory: CostByCategory[];
  topMaterials: TopMaterial[];
  laborByOperator: LaborByOperator[];
  byOrder: CostByOrder[];
  byProduct: CostByProduct[];
  costTrends: { date: string; cost: number; category: string }[];
}

// Profitability Reports
export interface ProfitabilityMetrics {
  totalProfit: number;
  netProfit: number;
  grossMargin: number; // percentage
  netMargin: number; // percentage
  roi: number; // percentage
  profitGrowth: number; // percentage change
  averageProfitPerOrder: number;
}

export interface ProfitByProduct {
  productId: string;
  productName: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  marginPercentage: number;
}

export interface ProfitByCustomer {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  lifetimeValue: number;
}

export interface ProfitByCategory {
  category: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
}

export interface ProfitabilityReport {
  metrics: ProfitabilityMetrics;
  financial: FinancialSummary;
  byProduct: ProfitByProduct[];
  byCategory: ProfitByCategory[];
  byCustomer: ProfitByCustomer[];
  byPeriod: { date: string; profit: number; margin: number }[];
}

// Machines Reports
export interface MachineMetrics {
  totalMachines: number;
  activeMachines: number;
  averageUtilization: number;
  averageEfficiency: number;
  totalUptime: number;
  totalDowntime: number;
  totalIdleTime: number;
}

export interface MachineUtilization {
  machineId: string;
  machineName: string;
  name: string;
  type: string;
  model: string;
  status: string;
  utilizationRate: number;
  uptime: number;
  downtime: number;
  efficiency: number;
  activeTime: number;
  idleTime: number;
  jobsCompleted: number;
  averageJobTime: number;
  costPerHour: number;
  maintenanceHistory: Array<{ date: Date; type: string }>;
}

export interface MachinesReport {
  metrics: MachineMetrics;
  machines: MachineUtilization[];
  utilization: MachineUtilization[];
  performanceTrends: { date: string; utilization: number; machineId: string }[];
}

// Operators Reports
export interface OperatorMetrics {
  totalOperators: number;
  activeOperators: number;
  averageProductivity: number;
  averageJobsPerDay: number;
  totalWorkHours: number;
  averageEfficiency: number;
  averageAccuracy: number;
}

export interface OperatorPerformance {
  operatorId: string;
  id: string;
  operatorName: string;
  name: string;
  role: string;
  jobsCompleted: number;
  averageTime: number;
  workHours: number;
  jobsPerHour: number;
  productivityRate: number;
  productivityScore: number;
  efficiency: number;
  errorCount: number;
  qualityScore: number;
  specializations: string[];
  accuracy: number;
  errors: number;
  productivity: number; // KPI score
  score: number; // overall rating
}

export interface TopPerformer {
  name: string;
  productivityScore: number;
  jobsCompleted: number;
}

export interface OperatorsReport {
  metrics: OperatorMetrics;
  operators: OperatorPerformance[];
  topPerformers: TopPerformer[];
  performance: OperatorPerformance[];
  productivityTrends: { date: string; productivity: number; operatorId: string }[];
}

// Customers Reports
export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  averageLTV: number;
  averageFrequency: number;
  retentionRate: number;
  averageLifetimeValue: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  name: string;
  email: string;
  totalOrders: number;
  ordersCount: number;
  orderFrequency: number;
  lastOrderDate: Date;
  totalRevenue: number;
  averageOrderValue: number;
  lifetimeValue: number;
  frequency: number; // orders per month
  favoriteProducts: string[];
}

export interface CustomerSegment {
  name: string;
  description: string;
  customerCount: number;
  percentage: number;
  averageLTV: number;
}

export interface ProductPreference {
  productName: string;
  orderCount: number;
  percentage: number;
}

export interface PurchaseBehavior {
  averageFrequency: number;
  averageOrderValue: number;
  preferredTimeSlot: string;
}

export interface CustomersReport {
  metrics: CustomerMetrics;
  segments: CustomerSegment[];
  topCustomers: TopCustomer[];
  productPreferences: ProductPreference[];
  purchaseBehavior: PurchaseBehavior;
  customerSegments: { segment: string; count: number; revenue: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. SALES REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchSalesReport = useCallback(async (filters: ReportFilters): Promise<SalesReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching sales report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.customerId && { customerId: filters.customerId }),
      });

      const response = await fetch(`/api/admin/reports/sales?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch sales report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. ORDERS REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchOrdersReport = useCallback(async (filters: ReportFilters): Promise<OrdersReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching orders report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/reports/orders?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch orders report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. PRODUCTION REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchProductionReport = useCallback(async (filters: ReportFilters): Promise<ProductionReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching production report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.machineId && { machineId: filters.machineId }),
        ...(filters.operatorId && { operatorId: filters.operatorId }),
      });

      const response = await fetch(`/api/admin/reports/production?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch production report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch production report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 4. COST REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchCostsReport = useCallback(async (filters: ReportFilters): Promise<CostReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching costs report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.productId && { productId: filters.productId }),
      });

      const response = await fetch(`/api/admin/reports/costs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch costs report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch costs report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. PROFITABILITY REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchProfitabilityReport = useCallback(async (filters: ReportFilters): Promise<ProfitabilityReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching profitability report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.customerId && { customerId: filters.customerId }),
      });

      const response = await fetch(`/api/admin/reports/profitability?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profitability report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch profitability report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 6. MACHINES REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchMachinesReport = useCallback(async (filters: ReportFilters): Promise<MachinesReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching machines report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.machineId && { machineId: filters.machineId }),
      });

      const response = await fetch(`/api/admin/reports/machines?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch machines report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch machines report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 7. OPERATORS REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchOperatorsReport = useCallback(async (filters: ReportFilters): Promise<OperatorsReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching operators report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.operatorId && { operatorId: filters.operatorId }),
      });

      const response = await fetch(`/api/admin/reports/operators?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch operators report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch operators report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 8. CUSTOMERS REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchCustomersReport = useCallback(async (filters: ReportFilters): Promise<CustomersReport> => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Reports', 'Fetching customers report', { filters });

      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        ...(filters.customerId && { customerId: filters.customerId }),
      });

      const response = await fetch(`/api/admin/reports/customers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers report');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Reports', 'Failed to fetch customers report', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchSalesReport,
    fetchOrdersReport,
    fetchProductionReport,
    fetchCostsReport,
    fetchProfitabilityReport,
    fetchMachinesReport,
    fetchOperatorsReport,
    fetchCustomersReport,
  };
}
