'use client';

import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/modules/cart/cartStore';

interface CheckoutSummaryProps {
  isLoading?: boolean;
  isProcessing?: boolean;
  onPlaceOrder?: () => void;
}

export function CheckoutSummary({
  isLoading = false,
  isProcessing = false,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  const { items, getTotals } = useCartStore();
  const totals = getTotals();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rezumat comandă</h2>
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Coșul tău este gol</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-4">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Rezumat comandă</h2>

      {/* Cart Items */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start text-sm">
            <div className="flex-1 pr-3">
              <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
              <p className="text-gray-500 text-xs mt-1">Qty: {item.specifications.quantity}</p>
            </div>
            <p className="font-semibold text-gray-900 whitespace-nowrap">
              {item.totalPrice.toFixed(2)} RON
            </p>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{totals.subtotal.toFixed(2)} RON</span>
        </div>

        {/* Discount */}
        {totals.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Reducere</span>
            <span>-{totals.discount.toFixed(2)} RON</span>
          </div>
        )}

        {/* VAT */}
        <div className="flex justify-between text-gray-600">
          <span>TVA (19%)</span>
          <span>{totals.vat.toFixed(2)} RON</span>
        </div>

        {/* Shipping (will be updated when delivery method is selected) */}
        <div className="flex justify-between text-gray-600">
          <span>Transport</span>
          <span id="shipping-cost">0.00 RON</span>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-[#0066FF] to-blue-600 rounded-lg p-4 mb-6 text-white">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium">Total de plată</span>
          <span className="text-2xl font-bold">{(totals.total + 0).toFixed(2)} RON</span>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Ai un cod promotional?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Introdu codul"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
          />
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors text-sm">
            Aplică
          </button>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onPlaceOrder}
        disabled={isLoading || isProcessing}
        className="w-full bg-[#0066FF] hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Se procesează...
          </>
        ) : (
          <>
            Plasează comanda
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Continue Shopping Link */}
      <a
        href="/products"
        className="w-full text-center text-[#0066FF] hover:text-blue-700 font-medium text-sm py-2 block transition-colors"
      >
        ← Continua cumpărăturile
      </a>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-center text-xs text-gray-500">
        <div className="flex justify-center gap-2">
          <span>🔒 Plată Securizată</span>
          <span>📦 Livrare Rapidă</span>
        </div>
        <p>Comanda ta este protejată 100%</p>
      </div>
    </div>
  );
}
