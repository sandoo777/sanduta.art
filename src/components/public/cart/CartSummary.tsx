'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCartStore } from '@/modules/cart/cartStore';
import { validateCart } from '@/lib/cart/validateCart';

export function CartSummary() {
  const router = useRouter();
  const { cart, total, refresh } = useCart();
  const store = useCartStore();
  const items = cart.length > 0 ? cart : store.items;
  const totals = cart.length > 0 ? { itemCount: cart.reduce((sum, item) => sum + (item.qty || 1), 0), subtotal: total, total, discount: 0, vat: total * 0.19 } : store.getTotals();
  const errors = validateCart(items as any);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCheckout = async () => {
    if (errors.length > 0) return;
    await fetch('/api/checkout', { method: 'POST' });
    await refresh();
    router.push('/checkout');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
      {errors.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
          <div className="font-semibold mb-1">Corectează următoarele erori:</div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {errors.map((err) => (
              <li key={err.itemId + err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-[#0066FF]" />
        Sumar comandă
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'produs' : 'produse'})
          </span>
          <span className="font-medium text-gray-900">{formatPrice(totals.subtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Reducere</span>
            <span className="font-medium text-green-600">-{formatPrice(totals.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">TVA (19%)</span>
          <span className="font-medium text-gray-900">{formatPrice(totals.vat)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center" data-testid="cart-total">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#0066FF]">{formatPrice(totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {cart.map((item) => (
          <div key={item.id} data-testid="cart-item" className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {item.name || item.productId} × {item.qty}
          </div>
        ))}
      </div>

      <button
        data-testid="checkout-btn"
        onClick={handleCheckout}
        className={`w-full rounded-lg py-4 px-6 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors
          ${errors.length > 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0066FF] text-white hover:bg-[#0052CC] hover:shadow-xl'}`}
        disabled={errors.length > 0}
      >
        Finalizează comanda
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
