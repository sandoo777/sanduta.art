/**
 * API Endpoints - Funcții centralizate pentru apeluri API frecvente
 * 
 * Elimină duplicarea de cod pentru cele mai folosite endpoint-uri.
 * Fiecare funcție include type-safety și error handling consistent.
 * 
 * @module lib/api/endpoints
 */

import { apiClient, ApiResponse } from './client';
import type { 
  User, 
  Product, 
  Order, 
  Category,
  OrderStatus,
  UserRole
} from '@prisma/client';

/**
 * ========================================
 * ADMIN - USERS
 * ========================================
 */

export interface UserFilters {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: UserRole;
}

/**
 * Fetch all users cu filtre opționale
 */
export async function fetchUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
  return apiClient.get<User[]>('/api/admin/users', { params: filters as any });
}

/**
 * Fetch user by ID
 */
export async function fetchUserById(userId: string): Promise<ApiResponse<User>> {
  return apiClient.get<User>(`/api/admin/users/${userId}`);
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  data: UserUpdateData
): Promise<ApiResponse<User>> {
  return apiClient.patch<User>(`/api/admin/users/${userId}`, data);
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ApiResponse<User>> {
  return apiClient.patch<User>(`/api/admin/users/${userId}`, { role });
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/admin/users/${userId}`);
}

/**
 * ========================================
 * ADMIN - ORDERS
 * ========================================
 */

export interface OrderFilters {
  status?: OrderStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface OrderUpdateData {
  status?: OrderStatus;
  notes?: string;
}

/**
 * Fetch all orders cu filtre
 */
export async function fetchOrders(filters?: OrderFilters): Promise<ApiResponse<Order[]>> {
  return apiClient.get<Order[]>('/api/admin/orders', { params: filters as any });
}

/**
 * Fetch order by ID
 */
export async function fetchOrderById(orderId: string): Promise<ApiResponse<Order>> {
  return apiClient.get<Order>(`/api/admin/orders/${orderId}`);
}

/**
 * Update order
 */
export async function updateOrder(
  orderId: string,
  data: OrderUpdateData
): Promise<ApiResponse<Order>> {
  return apiClient.patch<Order>(`/api/admin/orders/${orderId}`, data);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  return apiClient.patch<Order>(`/api/admin/orders/${orderId}`, { status });
}

/**
 * Delete order
 */
export async function deleteOrder(orderId: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/admin/orders/${orderId}`);
}

/**
 * ========================================
 * ADMIN - PRODUCTS
 * ========================================
 */

export interface ProductFilters {
  categoryId?: string;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductCreateData {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  images?: string[];
  stock?: number;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {}

/**
 * Fetch all products cu filtre
 */
export async function fetchProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
  return apiClient.get<Product[]>('/api/admin/products', { params: filters as any });
}

/**
 * Fetch product by ID
 */
export async function fetchProductById(productId: string): Promise<ApiResponse<Product>> {
  return apiClient.get<Product>(`/api/admin/products/${productId}`);
}

/**
 * Create product
 */
export async function createProduct(data: ProductCreateData): Promise<ApiResponse<Product>> {
  return apiClient.post<Product>('/api/admin/products', data);
}

/**
 * Update product
 */
export async function updateProduct(
  productId: string,
  data: ProductUpdateData
): Promise<ApiResponse<Product>> {
  return apiClient.patch<Product>(`/api/admin/products/${productId}`, data);
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/admin/products/${productId}`);
}

/**
 * ========================================
 * ADMIN - THEME
 * ========================================
 */

export interface ThemeConfig {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  layout?: Record<string, any>;
}

/**
 * Fetch current theme
 */
export async function fetchTheme(): Promise<ApiResponse<ThemeConfig>> {
  return apiClient.get<ThemeConfig>('/api/admin/theme');
}

/**
 * Fetch published theme
 */
export async function fetchPublishedTheme(): Promise<ApiResponse<ThemeConfig>> {
  return apiClient.get<ThemeConfig>('/api/admin/theme/published');
}

/**
 * Update theme
 */
export async function updateTheme(config: ThemeConfig): Promise<ApiResponse<ThemeConfig>> {
  return apiClient.put<ThemeConfig>('/api/admin/theme', config);
}

/**
 * Publish theme
 */
export async function publishTheme(): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('/api/admin/theme/publish');
}

/**
 * ========================================
 * PUBLIC - CATEGORIES
 * ========================================
 */

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  return apiClient.get<Category[]>('/api/categories');
}

/**
 * Fetch category by ID
 */
export async function fetchCategoryById(categoryId: string): Promise<ApiResponse<Category>> {
  return apiClient.get<Category>(`/api/categories/${categoryId}`);
}

/**
 * ========================================
 * PUBLIC - PRODUCTS (for customers)
 * ========================================
 */

export interface PublicProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

/**
 * Fetch products (public)
 */
export async function fetchPublicProducts(
  filters?: PublicProductFilters
): Promise<ApiResponse<Product[]>> {
  return apiClient.get<Product[]>('/api/products', { params: filters as any });
}

/**
 * Fetch single product (public)
 */
export async function fetchPublicProductById(productId: string): Promise<ApiResponse<Product>> {
  return apiClient.get<Product>(`/api/products/${productId}`);
}

/**
 * ========================================
 * USER - ORDERS (for customers)
 * ========================================
 */

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: string;
  notes?: string;
}

/**
 * Fetch user's orders
 */
export async function fetchUserOrders(): Promise<ApiResponse<Order[]>> {
  return apiClient.get<Order[]>('/api/orders');
}

/**
 * Fetch user's order by ID
 */
export async function fetchUserOrderById(orderId: string): Promise<ApiResponse<Order>> {
  return apiClient.get<Order>(`/api/orders/${orderId}`);
}

/**
 * Create order
 */
export async function createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
  return apiClient.post<Order>('/api/orders', data);
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
  return apiClient.post<Order>(`/api/orders/${orderId}/cancel`);
}

/**
 * ========================================
 * STATISTICS
 * ========================================
 */

export interface StatsResponse {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}

/**
 * Fetch dashboard stats
 */
export async function fetchStats(): Promise<ApiResponse<StatsResponse>> {
  return apiClient.get<StatsResponse>('/api/admin/stats');
}
