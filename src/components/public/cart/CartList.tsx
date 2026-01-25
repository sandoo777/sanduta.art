'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
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
      <EmptyState
        icon={<ShoppingCart className="h-16 w-16" />}
        title="Coșul tău este gol"
        description="Începe configurarea unui produs pentru a-l adăuga în coș."
        action={{
          label: "Explorează produsele",
          href: "/produse"
        }}
      />
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
