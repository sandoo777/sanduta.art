// ───────────────────────────────────────────────────────────────
// TYPES FOR REPORTS & ANALYTICS MODULE
// ───────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────
// OVERVIEW REPORT
// ───────────────────────────────────────────────────────────────
export interface OverviewKPIs {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  monthlyGrowth: number;
  ordersGrowth: number;
  topSellingProduct: {
    id: string;
    name: string;
    sales: number;
  } | null;
}

// ───────────────────────────────────────────────────────────────
// SALES REPORT
// ───────────────────────────────────────────────────────────────
export interface SalesReport {
  salesByMonth: MonthlyRevenue[];
  salesByDay: DailyRevenue[];
  salesBySource: SalesBySource[];
  salesByChannel: SalesByChannel[];
  salesByStatus: SalesByStatus[];
  totalRevenue: number;
  totalOrders: number;
}

export interface MonthlyRevenue {
  month: string; // "2026-01"
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface DailyRevenue {
  date: string; // "2026-01-04"
  revenue: number;
  orders: number;
}

export interface SalesBySource {
  source: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface SalesByChannel {
  channel: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface SalesByStatus {
  status: string;
  count: number;
  percentage: number;
}

// ───────────────────────────────────────────────────────────────
// PRODUCTS REPORT
// ───────────────────────────────────────────────────────────────
export interface ProductsReport {
  topSellingProducts: TopProduct[];
  productsByCategory: CategoryRevenue[];
  revenueByProduct: ProductRevenue[];
  productPerformance: ProductPerformance[];
  totalProducts: number;
  totalRevenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  avgPrice: number;
}

export interface CategoryRevenue {
  categoryId: string;
  categoryName: string;
  revenue: number;
  productsCount: number;
  totalQuantity: number;
}

export interface ProductRevenue {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  percentage: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  totalRevenue: number;
  totalQuantity: number;
  avgOrderValue: number;
  ordersCount: number;
}

// ───────────────────────────────────────────────────────────────
// CUSTOMERS REPORT
// ───────────────────────────────────────────────────────────────
export interface CustomersReport {
  topCustomers: TopCustomer[];
  newCustomersByMonth: MonthlyCustomers[];
  returningCustomers: {
    total: number;
    percentage: number;
  };
  customerLifetimeValue: {
    average: number;
    median: number;
    total: number;
  };
  customerSegments: {
    high: number;
    medium: number;
    low: number;
  };
  totalCustomers: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string;
}

export interface MonthlyCustomers {
  month: string;
  count: number;
}

// ───────────────────────────────────────────────────────────────
// OPERATORS REPORT
// ───────────────────────────────────────────────────────────────
export interface OperatorsReport {
  operatorJobs: OperatorJobs[];
  completionTimesByOperator: CompletionTimes[];
  operatorEfficiency: OperatorEfficiency[];
  totalJobs: number;
  totalCompletedJobs: number;
  avgCompletionTimeAllOperators: number;
}

export interface OperatorJobs {
  operatorId: string;
  operatorName: string;
  operatorEmail: string;
  jobsCompleted: number;
  jobsInProgress: number;
  avgCompletionTime: number;
}

export interface CompletionTimes {
  operatorId: string;
  operatorName: string;
  completionTimes: number[];
  avgTime: number;
  minTime: number;
  maxTime: number;
}

export interface OperatorEfficiency {
  operatorId: string;
  operatorName: string;
  efficiencyScore: number;
  jobsCompleted: number;
  avgCompletionTime: number;
  onTimeJobs: number;
  lateJobs: number;
}

// ───────────────────────────────────────────────────────────────
// MATERIALS REPORT
// ───────────────────────────────────────────────────────────────
export interface MaterialsReport {
  topConsumedMaterials: TopMaterial[];
  consumptionByMonth: MonthlyConsumption[];
  lowStockMaterials: LowStockMaterial[];
  totalMaterials: number;
  totalConsumption: number;
  totalCost: number;
  avgConsumptionPerJob: number;
}

export interface TopMaterial {
  id: string;
  name: string;
  sku: string;
  unit: string;
  totalConsumed: number;
  totalCost: number;
  usageCount: number;
}

export interface MonthlyConsumption {
  month: string;
  totalQuantity: number;
  totalCost: number;
  materialsUsed: number;
}

export interface LowStockMaterial {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  difference: number;
  costPerUnit: number;
}
