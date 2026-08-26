'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartLine = {
  id: string;
  productId: string;
  qty: number;
  price?: number;
  name?: string;
};

interface CartContextType {
  cart: CartLine[];
  total: number;
  addToCart: (productOrId: string | { id?: string | number; productId?: string | number; price?: number; name?: string }, qty?: number, priceOverride?: number) => Promise<any>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartLine[]>([]);

  const refresh = async () => {
    try {
      const response = await fetch('/api/cart', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setCart(Array.isArray(data?.cart) ? data.cart : []);
    } catch (error) {
      console.warn('CartContext refresh failed:', error);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const addToCart = async (
    productOrId: string | { id?: string | number; productId?: string | number; price?: number; name?: string },
    qty = 1,
    priceOverride?: number,
  ) => {
    const payload = typeof productOrId === 'string'
      ? { productId: productOrId, qty, price: priceOverride }
      : {
          productId: String(productOrId.productId ?? productOrId.id ?? 'product-unknown'),
          qty: Number(qty) || 1,
          price: typeof priceOverride === 'number' ? priceOverride : productOrId.price,
          name: productOrId.name,
        };

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    const data = await response.json();
    const nextCart = Array.isArray(data?.cart) ? data.cart : cart;
    setCart(nextCart);
    return data;
  };

  const removeFromCart = async (productId: string) => {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId }),
    });

    if (response.ok) {
      await refresh();
    }
  };

  const clearCart = async () => {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clearAll: true }),
    });

    if (response.ok) {
      await refresh();
    }
  };

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0),
    [cart],
  );

  return (
    <CartContext.Provider value={{ cart, total, addToCart, removeFromCart, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};