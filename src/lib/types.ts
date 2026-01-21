/**
 * @deprecated Use types from @/types/models, @/types/api, @/types/pagination instead
 * This file is kept for backward compatibility and will be removed in future
 */

// Re-export from centralized types
export type { Product, Order, OrderItem } from '@/types/models';

// Legacy CartItem interface (should use OrderItem)
export interface CartItem {
  product: Product;
  quantity: number;
}