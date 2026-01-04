'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePriceCalculator, type PriceSelection, type PriceBreakdown } from '@/modules/configurator/usePriceCalculator';

interface PriceSidebarProps {
  selection: PriceSelection;
  productName: string;
  onContinue?: () => void;
}

export function PriceSidebar({ selection, productName, onContinue }: PriceSidebarProps) {
  const calculator = usePriceCalculator();
  const [breakdown, setBreakdown] = useState<PriceBreakdown>(() => calculator.calcTotal(selection));

  // Debounced price recompute
  useEffect(() => {
    const handle = setTimeout(() => {
      setBreakdown(calculator.calcTotal(selection));
    }, 180);
    return () => clearTimeout(handle);
  }, [selection, calculator]);

  const formatted = useMemo(() => {
    const format = (v: number) => `${v.toFixed(2)} MDL`;
    return {
      base: format(breakdown.base),
      finishes: format(breakdown.finishes),
      quantity: format(breakdown.quantity),
      production: format(breakdown.production),
      total: format(breakdown.total),
      savings: breakdown.savings ? format(breakdown.savings) : null,
    };
  }, [breakdown]);

  return (
    <aside className="bg-white border border-gray-200 rounded-lg shadow-lg p-5 sm:p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Preț estimat</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatted.total}</h3>
        </div>
        <span className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">Live</span>
      </div>

      <div className="space-y-3 mb-4">
        <BreakdownRow label="Bază" value={formatted.base} />
        <BreakdownRow label="Finisaje" value={formatted.finishes} />
        <BreakdownRow label="Cantitate" value={formatted.quantity} />
        <BreakdownRow label="Producție" value={formatted.production} />
        {formatted.savings && (
          <BreakdownRow label="Economii" value={`- ${formatted.savings}`} highlight />
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800 font-semibold">{productName}</p>
        <p className="text-xs text-blue-700">Pasul 1 · Specificații principale</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Continuă la pasul 2
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>Prețurile sunt estimative și pot varia în funcție de verificarea fișierelor.</p>
        <p>TVA inclus. Livrarea se calculează în pasul final.</p>
      </div>
    </aside>
  );
}

function BreakdownRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={highlight ? 'text-green-600 font-semibold' : 'text-gray-900 font-semibold'}>{value}</span>
    </div>
  );
}
