/**
 * API Module - Central Export
 * 
 * Exportă tot ce e necesar pentru API calls centralizate.
 * 
 * Usage:
 * ```ts
 * import { fetchUsers, updateUserRole, apiClient } from '@/lib/api';
 * 
 * const { data, error } = await fetchUsers({ role: 'ADMIN' });
 * ```
 * 
 * @module lib/api
 */

// Client
export { apiClient, isSuccess, getErrorMessage, ApiError } from './client';
export type { ApiResponse, ApiRequestOptions } from './client';

// Endpoints
export {
  // Users
  fetchUsers,
  fetchUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  // Orders
  fetchOrders,
  fetchOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  // Products
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Theme
  fetchTheme,
  fetchPublishedTheme,
  updateTheme,
  publishTheme,
  // Categories
  fetchCategories,
  fetchCategoryById,
  // Public Products
  fetchPublicProducts,
  fetchPublicProductById,
  // User Orders
  fetchUserOrders,
  fetchUserOrderById,
  createOrder,
  cancelOrder,
  // Stats
  fetchStats,
} from './endpoints';

export type {
  UserFilters,
  UserUpdateData,
  OrderFilters,
  OrderUpdateData,
  ProductFilters,
  ProductCreateData,
  ProductUpdateData,
  ThemeConfig,
  PublicProductFilters,
  CreateOrderData,
  StatsResponse,
} from './endpoints';

// Optimization utilities (existing)
export {
  getPaginationFromRequest,
  createPaginatedResponse,
  getFieldsFromRequest,
  filterFields,
  generateETag,
  checkETag,
  createOptimizedResponse,
  createNotModifiedResponse,
  CacheStrategies,
} from './optimizeApi';

export type {
  PaginationOptions,
  PaginatedResult,
} from './optimizeApi';
