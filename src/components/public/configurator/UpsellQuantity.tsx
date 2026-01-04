"use client";

import { type QuantitySuggestion } from '@/modules/configurator/useUpsellEngine';

interface UpsellQuantityProps {
  suggestions: QuantitySuggestion[];
  onSelect: (quantity: number, delta: number, savingsText: string) => void;
  currentQuantity: number;
}

export function UpsellQuantity({ suggestions, onSelect, currentQuantity }: UpsellQuantityProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Cantitate mai avantajoasă</p>
          <p className="text-xs text-gray-600">Obține cost pe bucată mai bun crescând tirajul.</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">Upsell</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {suggestions.map((s) => (
          <button
            key={s.quantity}
            onClick={() => onSelect(s.quantity, s.extraCost, `${s.savingsPerUnitPct.toFixed(0)}%/buc economisite`)}
            className="text-left border border-gray-200 rounded-lg p-3 bg-white hover:border-blue-400 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-lg font-bold text-gray-900">{s.quantity} buc</p>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">
                {s.extraCost >= 0 ? `+${s.extraCost.toFixed(0)} MDL` : `${s.extraCost.toFixed(0)} MDL`}
              </span>
            </div>
            <p className="text-sm text-gray-700">{s.message}</p>
            <p className="text-xs text-gray-500 mt-1">Preț/buc: {s.unitPrice.toFixed(2)} MDL</p>
          </button>
        ))}
        {suggestions.length === 0 && (
          <div className="col-span-1 md:col-span-3 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-3">
            Pentru {currentQuantity} buc. nu avem o ofertă mai bună în acest moment.
          </div>
        )}
      </div>
    </div>
  );
}
