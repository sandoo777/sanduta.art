'use client';

/**
 * Hook unificat pentru gestionarea procesului de checkout
 * 
 * Acest hook re-exportă funcționalitatea din modulul checkout,
 * oferind un punct de acces centralizat pentru toate operațiunile
 * legate de checkout în aplicație.
 * 
 * Features:
 * - Validare date client, adresă, telefon, email
 * - Gestionare metode de livrare și plată
 * - Procesare comandă cu integrări Paynet + Nova Poshta
 * - Trimitere email-uri de confirmare
 * - Gestionare stări de loading/error
 * 
 * @module hooks/useCheckout
 * @see src/modules/checkout/useCheckout.ts - Implementare completă
 */

import {
  useCheckout as useCheckoutBase,
  type CustomerData,
  type AddressData,
  type DeliveryMethod,
  type PaymentMethod,
  type CheckoutData,
} from '@/modules/checkout/useCheckout';

/**
 * Hook pentru gestionarea procesului de checkout
 * Wrapper peste implementarea din modulul checkout
 * 
 * @returns {Object} Obiect cu metode de validare și procesare checkout
 */
export function useCheckout() {
  return useCheckoutBase();
}

// Re-export types pentru convenience
export type {
  CustomerData,
  AddressData,
  DeliveryMethod,
  PaymentMethod,
  CheckoutData,
};

/**
 * Exemplu de utilizare:
 * 
 * @example
 * ```tsx
 * function CheckoutPage() {
 *   const {
 *     validateCustomerData,
 *     validateAddressData,
 *     processOrder,
 *     isLoading,
 *     error,
 *   } = useCheckout();
 * 
 *   const handleSubmit = async (data: CheckoutData) => {
 *     const result = await processOrder(data);
 *     
 *     if (result.success) {
 *       router.push(`/order-confirmation?id=${result.orderId}`);
 *     } else {
 *       alert(result.error);
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       // Form fields
 *     </form>
 *   );
 * }
 * ```
 * 
 * @see {@link https://github.com/sandoo777/sanduta.art/blob/main/docs/CHECKOUT_FLOW.md} Documentație completă proces checkout
 */
