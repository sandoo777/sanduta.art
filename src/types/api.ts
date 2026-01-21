/**
 * API Types
 * Tipuri pentru request/response API
 */

import { OrderStatus, PaymentStatus, DeliveryStatus, UserRole } from './models';

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC API RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateOrderRequest {
  customerId?: string;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  source: 'ONLINE' | 'OFFLINE';
  channel: 'WEB' | 'PHONE' | 'WALK_IN' | 'EMAIL';
  items: CreateOrderItemRequest[];
  deliveryAddress?: string;
  deliveryCity?: string;
  notes?: string;
  dueDate?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
  customDescription?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  assignedToUserId?: string;
  notes?: string;
  dueDate?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  categoryId?: string;
  images?: string[];
  active?: boolean;
  stock?: number;
  tags?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  active?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  token?: string;
  expiresAt?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category?: {
    id: string;
    name: string;
  };
  active: boolean;
  stock: number;
}

export interface StatsResponse {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH & FILTER
// ═══════════════════════════════════════════════════════════════════════════

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  assignedToUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  active?: boolean;
  search?: string;
  tags?: string[];
}

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface BatchUpdateRequest<T> {
  ids: string[];
  updates: Partial<T>;
}

export interface BatchDeleteRequest {
  ids: string[];
  permanent?: boolean;
}

export interface BatchOperationResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE UPLOAD
// ═══════════════════════════════════════════════════════════════════════════

export interface FileUploadRequest {
  file: File;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface FileUploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface BulkFileUploadResponse {
  success: boolean;
  files: FileUploadResponse[];
  failedFiles?: Array<{
    filename: string;
    error: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WebhookPayload<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
  signature?: string;
}

export interface PaymentWebhook {
  transactionId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface ShippingWebhook {
  trackingNumber: string;
  orderId: string;
  status: DeliveryStatus;
  carrier: string;
  estimatedDelivery?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ═══════════════════════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════════════════════

export interface RequestMetadata {
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  path: string;
  method: string;
}

export interface ResponseMetadata {
  requestId: string;
  duration: number;
  cached?: boolean;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: Date;
  };
}
