'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/modules/cart/cartStore';

export function CartSummary() {
  const router = useRouter();
  const { items, getTotals } = useCartStore();
  const totals = getTotals();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-[#0066FF]" />
        Sumar comandă
      </h2>

      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'produs' : 'produse'})
          </span>
          <span className="font-medium text-gray-900">{formatPrice(totals.subtotal)}</span>
        </div>

        {/* Discount */}
        {totals.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Reducere</span>
            <span className="font-medium text-green-600">-{formatPrice(totals.discount)}</span>
          </div>
        )}

        {/* VAT */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">TVA (19%)</span>
          <span className="font-medium text-gray-900">{formatPrice(totals.vat)}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#0066FF]">{formatPrice(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-700">
            Costul livrării va fi calculat la pasul următor în funcție de adresa de livrare.
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        className="w-full bg-[#0066FF] text-white rounded-lg py-4 px-6 font-semibold text-lg hover:bg-[#0052CC] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
      >
        Finalizează comanda
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">
          Livrare sigură
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-gray-600 text-center">Plată securizată</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="text-xs text-gray-600 text-center">Garanție calitate</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-8 h-8 text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span className="text-xs text-gray-600 text-center">Produse premium</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Timp de producție conform specificațiilor</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Suport clienți disponibil</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Modificări gratuite înainte de producție</span>
        </div>
      </div>
    </div>
  );
}
