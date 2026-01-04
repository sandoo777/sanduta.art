import { useMemo } from 'react';
import { usePriceCalculator, type PriceSelection } from './usePriceCalculator';

type QuantitySuggestion = {
  quantity: number;
  total: number;
  unitPrice: number;
  extraCost: number;
  savingsPerUnitPct: number;
  message: string;
};

type FinishSuggestion = {
  id: string;
  label: string;
  description: string;
  price: number;
  action:
    | { type: 'finish'; finish: PriceSelection['finishes'][number] }
    | { type: 'material'; material: PriceSelection['material'] };
};

type CrossSellSuggestion = {
  id: string;
  name: string;
  priceFrom: string;
  href: string;
};

const multipliers = [1.5, 2, 2.5];

export function useUpsellEngine() {
  const calculator = usePriceCalculator();

  const getQuantityUpsell = (selection: PriceSelection, currentTotal: number): QuantitySuggestion[] => {
    const currentQty = selection.quantity;
    const results: QuantitySuggestion[] = [];

    multipliers.forEach((multiplier) => {
      const qty = Math.max(currentQty + 50, Math.round(currentQty * multiplier));
      if (qty === currentQty) return;
      const nextSelection = { ...selection, quantity: qty };
      const breakdown = calculator.calcTotal(nextSelection);
      const unitPrice = breakdown.total / qty;
      const currentUnit = currentTotal / currentQty;
      const savingsPerUnitPct = Math.max(0, ((currentUnit - unitPrice) / currentUnit) * 100);
      const extraCost = breakdown.total - currentTotal;
      const message = `Adaugă ${qty} buc. cu ${extraCost >= 0 ? '+' : ''}${extraCost.toFixed(0)} MDL și economisești ${savingsPerUnitPct.toFixed(0)}%/buc.`;
      results.push({ quantity: qty, total: breakdown.total, unitPrice, extraCost, savingsPerUnitPct, message });
    });

    return results.slice(0, 3);
  };

  const getFinishUpsell = (productType: string, finishes: PriceSelection['finishes']): FinishSuggestion[] => {
    const normalized = productType.toLowerCase();
    const allowFoil = ['flyer', 'flyere', 'card', 'vizita', 'poster', 'afis', 'afise'].some((key) =>
      normalized.includes(key)
    );

    const suggestions: FinishSuggestion[] = [
      {
        id: 'mat',
        label: 'Laminare mată',
        description: 'Aspect elegant, anti-amprentă',
        price: 45,
        action: { type: 'finish', finish: 'laminare-mata' },
      },
      {
        id: 'glossy',
        label: 'Laminare lucioasă',
        description: 'Culori intense și protecție ridicată',
        price: 40,
        action: { type: 'finish', finish: 'laminare-lucioasa' },
      },
      {
        id: 'round',
        label: 'Colțuri rotunjite',
        description: 'Siguranță și aspect premium',
        price: 25,
        action: { type: 'finish', finish: 'colturi-rotunjite' },
      },
      {
        id: 'premium-paper',
        label: 'Hârtie premium 300g',
        description: 'Rigiditate și senzație premium',
        price: 0,
        action: { type: 'material', material: '300g' },
      },
    ];

    if (allowFoil) {
      suggestions.push(
        {
          id: 'foil-gold',
          label: 'Folio auriu',
          description: 'Accente metalice pentru un impact puternic',
          price: 120,
          action: { type: 'finish', finish: 'foliu-auriu' },
        },
        {
          id: 'foil-silver',
          label: 'Folio argintiu',
          description: 'Reflexii reci, moderne',
          price: 120,
          action: { type: 'finish', finish: 'foliu-argintiu' },
        }
      );
    }

    return suggestions.filter((s) => {
      if (s.action.type === 'finish') {
        return !finishes.includes(s.action.finish);
      }
      return true;
    });
  };

  const getCrossSellProducts = (productType: string): CrossSellSuggestion[] => {
    const normalized = productType.toLowerCase();
    if (normalized.includes('flyer') || normalized.includes('flyere')) {
      return [
        { id: 'postere', name: 'Postere A2', priceFrom: 'de la 120 MDL', href: '/produse/postere-a2' },
        { id: 'carti-vizita', name: 'Cărți de vizită', priceFrom: 'de la 90 MDL', href: '/produse/carti-de-vizita' },
        { id: 'afise', name: 'Afișe indoor', priceFrom: 'de la 110 MDL', href: '/produse/afise' },
      ];
    }
    if (normalized.includes('carte') || normalized.includes('vizita')) {
      return [
        { id: 'flyere', name: 'Flyere premium', priceFrom: 'de la 150 MDL', href: '/produse/flyere' },
        { id: 'mape', name: 'Mape de prezentare', priceFrom: 'de la 220 MDL', href: '/produse/mape' },
        { id: 'stickere', name: 'Stickere tăiate', priceFrom: 'de la 80 MDL', href: '/produse/stickere' },
      ];
    }
    if (normalized.includes('poster')) {
      return [
        { id: 'bannere', name: 'Bannere frontlit', priceFrom: 'de la 300 MDL', href: '/produse/bannere' },
        { id: 'rollup', name: 'Roll-up Premium', priceFrom: 'de la 450 MDL', href: '/produse/roll-up' },
        { id: 'flyere', name: 'Flyere', priceFrom: 'de la 120 MDL', href: '/produse/flyere' },
      ];
    }
    return [
      { id: 'carti-vizita', name: 'Cărți de vizită', priceFrom: 'de la 90 MDL', href: '/produse/carti-de-vizita' },
      { id: 'stickere', name: 'Stickere', priceFrom: 'de la 80 MDL', href: '/produse/stickere' },
      { id: 'bannere', name: 'Bannere', priceFrom: 'de la 300 MDL', href: '/produse/bannere' },
    ];
  };

  return useMemo(
    () => ({
      getQuantityUpsell,
      getFinishUpsell,
      getCrossSellProducts,
    }),
    []
  );
}

export type { QuantitySuggestion, FinishSuggestion, CrossSellSuggestion };
