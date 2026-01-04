"use client";

import { useMemo, useState } from 'react';
import { UpsellQuantity } from './UpsellQuantity';
import { UpsellFinishes } from './UpsellFinishes';
import { CrossSellProducts } from './CrossSellProducts';
import { useUpsellEngine, type QuantitySuggestion, type FinishSuggestion, type CrossSellSuggestion } from '@/modules/configurator/useUpsellEngine';
import { usePriceCalculator, type PriceSelection } from '@/modules/configurator/usePriceCalculator';
import { type SidebarUpsell } from './PriceSidebar';

interface Step3UpsellProps {
  productName: string;
  productType: string;
  selection: PriceSelection;
  onSelectionChange: (next: PriceSelection) => void;
  onContinue?: () => void;
  onUpsellChange?: (upsells: SidebarUpsell[]) => void;
}

export function Step3Upsell({ productName, productType, selection, onSelectionChange, onContinue, onUpsellChange }: Step3UpsellProps) {
  const calculator = usePriceCalculator();
  const engine = useUpsellEngine();

  const breakdown = useMemo(() => calculator.calcTotal(selection), [selection, calculator]);
  const quantitySuggestions: QuantitySuggestion[] = useMemo(
    () => engine.getQuantityUpsell(selection, breakdown.total),
    [engine, selection, breakdown.total]
  );
  const finishSuggestions: FinishSuggestion[] = useMemo(
    () => engine.getFinishUpsell(productType, selection.finishes),
    [engine, productType, selection.finishes]
  );
  const crossSell: CrossSellSuggestion[] = useMemo(
    () => engine.getCrossSellProducts(productType),
    [engine, productType]
  );

  const [upsells, setUpsells] = useState<SidebarUpsell[]>([]);

  const updateUpsells = (list: SidebarUpsell[]) => {
    setUpsells(list);
    onUpsellChange?.(list);
  };

  const applyQuantity = (quantity: number, delta: number, savingsText: string) => {
    const next = { ...selection, quantity };
    onSelectionChange(next);
    const entry: SidebarUpsell = { label: `${quantity} bucăți`, delta, savingsText, type: 'quantity' };
    updateUpsells([entry, ...upsells.filter((u) => u.type !== 'quantity')]);
  };

  const applyFinish = (suggestion: FinishSuggestion) => {
    if (suggestion.action.type === 'finish') {
      if (selection.finishes.includes(suggestion.action.finish)) return;
      const next = { ...selection, finishes: [...selection.finishes, suggestion.action.finish] };
      onSelectionChange(next);
    } else {
      if (selection.material === suggestion.action.material) return;
      const next = { ...selection, material: suggestion.action.material };
      onSelectionChange(next);
    }
    const entry: SidebarUpsell = { label: suggestion.label, delta: suggestion.price, type: 'finish' };
    updateUpsells([entry, ...upsells.filter((u) => u.label !== suggestion.label)]);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-gray-600">Pasul 3</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Recomandări pentru un rezultat mai bun</h2>
        <p className="text-sm text-gray-600">Ajustează cantitatea, adaugă finisaje premium sau configurează produse complementare.</p>
      </header>

      <UpsellQuantity
        suggestions={quantitySuggestions}
        currentQuantity={selection.quantity}
        onSelect={applyQuantity}
      />

      <UpsellFinishes suggestions={finishSuggestions} onAddFinish={applyFinish} />

      <CrossSellProducts items={crossSell} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-600">Continuă la sumarul comenzii și finalizează.</div>
        <button
          type="button"
          onClick={onContinue}
          className="px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition bg-blue-600 text-white hover:bg-blue-700"
        >
          Continuă la pasul 4
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
