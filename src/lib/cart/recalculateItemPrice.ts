// src/lib/cart/recalculateItemPrice.ts
// Reсalculează prețul CartItem pe bază de specificații și opțiuni
import type { CartItem, CartItemSpecifications, CartItemUpsell, CartItemPriceBreakdown } from '@/modules/cart/cartStore';

// Mock function pentru calcul preț - în viitor va folosi calculateProductPrice
// TODO: Integra cu calculateProductPrice() când structura de date e compatibilă
export function recalculateItemPrice(
  item: CartItem,
  options?: { upsells?: CartItemUpsell[]; quantity?: number; specifications?: Partial<CartItemSpecifications> }
): { priceBreakdown: CartItemPriceBreakdown; totalPrice: number } {
  // Actualizează specificațiile dacă sunt transmise valori noi
  const updatedSpecs = {
    ...item.specifications,
    ...options?.specifications,
    quantity: options?.quantity ?? item.specifications.quantity,
  };
  const upsells = options?.upsells ?? item.upsells;

  // Calcul simplu bazat pe cantitate și prețuri existente
  const basePrice = item.priceBreakdown.basePrice;
  const materialCost = item.priceBreakdown.materialCost * (updatedSpecs.quantity / item.specifications.quantity);
  const finishingCost = item.priceBreakdown.finishingCost * (updatedSpecs.quantity / item.specifications.quantity);
  const upsellsCost = upsells.reduce((sum, u) => sum + u.price, 0);
  
  // Calcul discount cantitate (5% pentru 10+, 10% pentru 50+, 15% pentru 100+)
  let quantityDiscount = 0;
  const subtotalBeforeDiscount = basePrice + materialCost + finishingCost + upsellsCost;
  if (updatedSpecs.quantity >= 100) {
    quantityDiscount = subtotalBeforeDiscount * 0.15;
  } else if (updatedSpecs.quantity >= 50) {
    quantityDiscount = subtotalBeforeDiscount * 0.10;
  } else if (updatedSpecs.quantity >= 10) {
    quantityDiscount = subtotalBeforeDiscount * 0.05;
  }

  const subtotal = subtotalBeforeDiscount - quantityDiscount;

  const priceBreakdown: CartItemPriceBreakdown = {
    basePrice,
    materialCost,
    finishingCost,
    upsellsCost,
    quantityDiscount,
    subtotal,
  };

  return {
    priceBreakdown,
    totalPrice: subtotal,
  };
}
