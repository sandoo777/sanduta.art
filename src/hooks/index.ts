/**
 * Hooks Index - Export centralizat pentru toate hook-urile custom
 * 
 * Acest fisier permite import-uri simple
 * import { useTheme, useAuth, useBlog } from '@/hooks'
 * 
 * @module hooks
 */

// Core Hooks
export { useTheme, useThemePublishing } from './useTheme';
export { useCheckout } from './useCheckout';
export { useSetup } from './useSetup';
export { useBlog } from './useBlog';
export { useAuth, useRequireAuth } from './useAuth';

// Existing Hooks
export { useCategories } from './useCategories';
export { useDebounce } from './useDebounce';

// Type Exports pentru convenience
export type {
  AuthUser,
  LoginCredentials,
  LoginResult,
} from './useAuth';

export type {
  BlogPost,
  BlogCategory,
  BlogFilters,
} from './useBlog';

export type {
  CustomerData,
  AddressData,
  DeliveryMethod,
  PaymentMethod,
  CheckoutData,
} from './useCheckout';
