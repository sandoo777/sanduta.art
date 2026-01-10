// src/lib/cart/validateCart.ts
// Валидация корзины: возвращает массив ошибок или пустой массив, если всё ок
import type { CartItem } from '@/modules/cart/cartStore';

export interface CartValidationError {
  itemId: string;
  message: string;
}

export function validateCart(items: CartItem[]): CartValidationError[] {
  const errors: CartValidationError[] = [];

  items.forEach((item) => {
    if (item.specifications.quantity < 1) {
      errors.push({
        itemId: item.id,
        message: 'Cantitatea trebuie să fie cel puțin 1.'
      });
    }
    if (!item.specifications.material?.id) {
      errors.push({
        itemId: item.id,
        message: 'Materialul nu este selectat.'
      });
    }
    // Можно добавить другие проверки (например, размеры, опции, проект и т.д.)
  });

  return errors;
}
