// src/lib/cart/recalculateItemPrice.ts
// Пересчитывает цену CartItem на основе спецификаций и опций
import type { CartItem, CartItemSpecifications, CartItemUpsell, CartItemPriceBreakdown } from '@/modules/cart/cartStore';
import { calculateProductPrice } from '@/lib/pricing/calculateProductPrice';

export function recalculateItemPrice(
  item: CartItem,
  options?: { upsells?: CartItemUpsell[]; quantity?: number; specifications?: Partial<CartItemSpecifications> }
): { priceBreakdown: CartItemPriceBreakdown; totalPrice: number } {
  // Обновляем спецификации, если переданы новые значения
  const updatedSpecs = {
    ...item.specifications,
    ...options?.specifications,
    quantity: options?.quantity ?? item.specifications.quantity,
  };
  const upsells = options?.upsells ?? item.upsells;
  // Используем существующий движок ценообразования
  const priceResult = calculateProductPrice({
    productId: item.productId,
    specifications: updatedSpecs,
    upsells,
  });
  return {
    priceBreakdown: priceResult.breakdown,
    totalPrice: priceResult.total,
  };
}
