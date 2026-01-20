// Orders Domain - Types
// Centralizează toate tipurile pentru domeniul comenzilor

import { Order, OrderItem, OrderTimeline, OrderStatus, PaymentStatus } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN ENTITIES
// ═══════════════════════════════════════════════════════════════════════════

export type { Order, OrderItem, OrderTimeline, OrderStatus, PaymentStatus };

// Order cu relații complete
export interface OrderWithRelations extends Order {
  customer?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items?: OrderItemWithProduct[];
  timeline?: OrderTimeline[];
  payment?: {
    id: string;
    status: string;
    amount: string;
  } | null;
  assignedTo?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface OrderItemWithProduct extends OrderItem {
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    price: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DTOs (Data Transfer Objects)
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateOrderDTO {
  customerId: string;
  source: 'ONLINE' | 'OFFLINE';
  channel: 'WEB' | 'PHONE' | 'WALK_IN' | 'EMAIL';
  items: CreateOrderItemDTO[];
  dueDate?: Date | string;
  notes?: string;
}

export interface CreateOrderItemDTO {
  productId: string;
  variantId?: string;
  quantity: number;
  customDescription?: string;
  price?: string;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  assignedToUserId?: string | null;
  notes?: string;
  dueDate?: Date | string;
}

export interface UpdateOrderItemDTO {
  quantity?: number;
  price?: string;
  customDescription?: string;
}

export interface OrderFileDTO {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY PARAMS
// ═══════════════════════════════════════════════════════════════════════════

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'totalPrice';
  sortOrder?: 'asc' | 'desc';
  customerId?: string;
  assignedToUserId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

export interface OrdersListResponse {
  orders: OrderWithRelations[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface OrderServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICS & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderStatistics {
  total: number;
  byStatus: Record<OrderStatus, number>;
  byPaymentStatus: Record<PaymentStatus, number>;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderTimeSeries {
  date: string;
  count: number;
  revenue: number;
}
