"use client";

import { useMemo } from 'react';

interface PriceBreakdownItem {
  label: string;
  value: number;
}

interface FinalPriceSidebarProps {
  currency?: string;
  basePrice: number;
  upsellsTotal?: number;
  discount?: number;
  delivery?: number;
  vatIncluded?: boolean;
  onAddToCart?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

function formatMoney(value: number, currency = 'RON') {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(value);
}

export function FinalPriceSidebar({
  currency = 'RON',
  basePrice,
  upsellsTotal = 0,
  discount = 0,
  delivery = 0,
  vatIncluded = true,
  onAddToCart,
  loading,
  disabled,
}: FinalPriceSidebarProps) {
  const breakdown: PriceBreakdownItem[] = useMemo(
    () => [
      { label: 'Produs', value: basePrice },
      { label: 'Extra opțiuni', value: upsellsTotal },
      { label: 'Transport', value: delivery },
      discount ? { label: 'Reducere', value: -discount } : null,
    ].filter(Boolean) as PriceBreakdownItem[],
    [basePrice, upsellsTotal, delivery, discount]
  );

  const total = breakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <aside className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Rezumat costuri</h3>
        <p className="text-sm text-gray-600">Verifică totalul înainte de a continua.</p>
      </div>

      <dl className="space-y-2 text-sm text-gray-700">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <dt>{item.label}</dt>
            <dd className="font-semibold">{formatMoney(item.value, currency)}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
        <p className="text-base font-semibold text-gray-900">Total</p>
        <p className="text-xl font-bold text-gray-900">{formatMoney(total, currency)}</p>
      </div>

      <p className="text-xs text-gray-500">{vatIncluded ? 'TVA inclus' : 'TVA neaplicat'}</p>

      <button
        type="button"
        onClick={onAddToCart}
        disabled={disabled || loading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Se adaugă...' : 'Adaugă în coș'}
      </button>
    </aside>
  );
}
