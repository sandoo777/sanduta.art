export type CartMemoryItem = {
  id: string;
  productId: string;
  qty: number;
  price: number;
  name?: string;
};

let cartMemory: CartMemoryItem[] = [];

export function getCartMemory(): CartMemoryItem[] {
  return cartMemory;
}

export function addCartMemoryItem(input: {
  productId: string;
  qty?: number;
  price?: number;
  name?: string;
}): CartMemoryItem {
  const safeProductId = String(input.productId ?? 'product-unknown');
  const safeQty = Number(input.qty) > 0 ? Number(input.qty) : 1;
  const safePrice = Number.isFinite(Number(input.price)) ? Number(input.price) : 0;

  const existing = cartMemory.find((item) => item.productId === safeProductId);
  if (existing) {
    existing.qty += safeQty;
    if (safePrice > 0) existing.price = safePrice;
    return existing;
  }

  const item: CartMemoryItem = {
    id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: safeProductId,
    qty: safeQty,
    price: safePrice,
    name: input.name,
  };

  cartMemory.push(item);
  return item;
}

export function clearCartMemory(): CartMemoryItem[] {
  cartMemory = [];
  return cartMemory;
}

export function removeCartMemoryItem(productId: string): CartMemoryItem[] {
  cartMemory = cartMemory.filter((item) => item.productId !== productId);
  return cartMemory;
}

export function setCartMemory(items: CartMemoryItem[]): CartMemoryItem[] {
  cartMemory = items;
  return cartMemory;
}
