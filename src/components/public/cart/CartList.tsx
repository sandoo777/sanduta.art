'use client';

import React from 'react';
import { CartItem } from './CartItem';
import { useCartStore } from '@/modules/cart/cartStore';

export default function CartList() {
  const { items, removeItem, duplicateItem, updateItem } = useCartStore();

  const handleRemove = (itemId: string) => {
    if (confirm('Sigur vrei să ștergi acest produs din coș?')) {
      removeItem(itemId);
    }
  };

  const handleDuplicate = (itemId: string) => {
    duplicateItem(itemId);
  };

  const handleQuantityChange = (itemId: string, newQty: number) => {
    updateItem(itemId, { specifications: { ...items.find(i => i.id === itemId)?.specifications, quantity: newQty } });
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Coșul tău este gol
          </h3>
          <p className="text-gray-600 mb-6">
            Începe configurarea unui produs pentru a-l adăuga în coș.
          </p>
          <a
            href="/produse"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors font-medium"
          >
            Explorează produsele
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={handleRemove}
          onDuplicate={handleDuplicate}
          onQuantityChange={handleQuantityChange}
        />
      ))}
    </div>
  );
}
