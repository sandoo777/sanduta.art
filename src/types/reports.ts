/**
 * Reports Types
 * Tipuri pentru sistem de rapoarte și export
 */

import { OrderStatus, PaymentStatus, UserRole } from './models';

// ═══════════════════════════════════════════════════════════════════════════
// DATE RANGE
// ═══════════════════════════════════════════════════════════════════════════

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export type DateRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FORMATS
// ═══════════════════════════════════════════════════════════════════════════

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
}

export interface ExportRequest {
  reportType: ReportType;
  dateRange: DateRangeParams;
  filters?: ReportFilters;
  options?: ExportOptions;
}

export interface ExportResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ReportType =
  | 'sales'
  | 'orders'
  | 'products'
  | 'customers'
  | 'materials'
  | 'inventory'
  | 'financial'
  | 'production'
  | 'performance';

export interface ReportFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  productId?: string;
  categoryId?: string;
  assignedToUserId?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SALES REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProfit: number;
  profitMargin: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByPaymentStatus: Record<PaymentStatus, number>;
  dailySales: DailySalesData[];
  topProducts: TopProductData[];
  topCustomers: TopCustomerData[];
}

export interface DailySalesData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface TopProductData {
  productId: string;
  productName: string;
  totalSales: number;
  unitsSold: number;
  revenue: number;
}

export interface TopCustomerData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderReportRow {
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  itemsCount: number;
  assignedTo?: string;
  notes?: string;
}

export interface OrderReportData {
  orders: OrderReportRow[];
  summary: OrderReportSummary;
}

export interface OrderReportSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface ProductReportRow {
  productName: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  totalSales: number;
  unitsSold: number;
  revenue: number;
  lastSold?: Date;
}

export interface ProductReportData {
  products: ProductReportRow[];
  summary: ProductReportSummary;
}

export interface ProductReportSummary {
  totalProducts: number;
  totalRevenue: number;
  totalUnitsSold: number;
  averagePrice: number;
  outOfStockCount: number;
  lowStockCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface MaterialReportRow {
  materialName: string;
  unit: string;
  currentStock: number;
  consumed: number;
  averageConsumptionPerOrder: number;
  totalCost: number;
  supplier?: string;
  lastRestocked?: Date;
}

export interface MaterialReportData {
  materials: MaterialReportRow[];
  summary: MaterialReportSummary;
}

export interface MaterialReportSummary {
  totalMaterials: number;
  totalConsumed: number;
  totalCost: number;
  lowStockItems: number;
  criticalStockItems: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface CustomerReportRow {
  customerId: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  status: 'active' | 'inactive' | 'new';
}

export interface CustomerReportData {
  customers: CustomerReportRow[];
  summary: CustomerReportSummary;
}

export interface CustomerReportSummary {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  totalRevenue: number;
  averageCustomerValue: number;
  repeatCustomerRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface InventoryReportRow {
  itemName: string;
  sku: string;
  category: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  lastRestocked?: Date;
}

export interface InventoryReportData {
  items: InventoryReportRow[];
  summary: InventoryReportSummary;
}

export interface InventoryReportSummary {
  totalItems: number;
  inStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockedItems: number;
  totalValue: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTION REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface ProductionReportRow {
  orderNumber: string;
  productName: string;
  quantity: number;
  startDate: Date;
  completedDate?: Date;
  duration?: number; // minutes
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  delayReason?: string;
}

export interface ProductionReportData {
  items: ProductionReportRow[];
  summary: ProductionReportSummary;
}

export interface ProductionReportSummary {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  delayedOrders: number;
  averageCompletionTime: number; // minutes
  onTimeDeliveryRate: number; // percentage
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface FinancialReportRow {
  date: Date;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  orders: number;
  averageOrderValue: number;
}

export interface FinancialReportData {
  rows: FinancialReportRow[];
  summary: FinancialReportSummary;
}

export interface FinancialReportSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageProfitMargin: number;
  grossProfit: number;
  netProfit: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export interface PerformanceReportRow {
  userId: string;
  userName: string;
  role: UserRole;
  ordersHandled: number;
  averageCompletionTime: number;
  customerSatisfaction: number;
  efficiency: number;
  period: string;
}

export interface PerformanceReportData {
  staff: PerformanceReportRow[];
  summary: PerformanceReportSummary;
}

export interface PerformanceReportSummary {
  totalStaff: number;
  averageEfficiency: number;
  averageSatisfaction: number;
  topPerformer: string;
  totalOrdersHandled: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHART DATA
// ═══════════════════════════════════════════════════════════════════════════

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ReportGenerationRequest {
  type: ReportType;
  dateRange: DateRangeParams;
  filters?: ReportFilters;
  groupBy?: string[];
  metrics?: string[];
}

export interface ReportGenerationResponse {
  success: boolean;
  reportId?: string;
  data?: unknown;
  error?: string;
  generatedAt: Date;
  executionTime: number; // ms
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT SCHEDULING
// ═══════════════════════════════════════════════════════════════════════════

export type ReportScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface ReportSchedule {
  id: string;
  reportType: ReportType;
  frequency: ReportScheduleFrequency;
  recipients: string[];
  filters?: ReportFilters;
  format: ExportFormat;
  active: boolean;
  nextRun?: Date;
  lastRun?: Date;
}

export interface ScheduledReportRun {
  scheduleId: string;
  runDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  exportUrl?: string;
  error?: string;
}
