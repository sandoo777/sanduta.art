type Dimension = 'A6' | 'A5' | 'A4' | 'custom';
type Material = '130g' | '170g' | '300g';
type Finish = 'laminare-lucioasa' | 'laminare-mata' | 'colturi-rotunjite' | 'perforare' | 'pliere';
type ProductionSpeed = 'standard' | 'express' | 'super-express';

export interface PriceSelection {
  dimension: Dimension;
  material: Material;
  finishes: Finish[];
  quantity: number;
  productionSpeed: ProductionSpeed;
}

export interface PriceBreakdown {
  base: number;
  finishes: number;
  quantity: number;
  production: number;
  total: number;
  savings?: number;
}

const basePrices: Record<Dimension, Record<Material, number>> = {
  A6: { '130g': 120, '170g': 140, '300g': 180 },
  A5: { '130g': 180, '170g': 210, '300g': 260 },
  A4: { '130g': 260, '170g': 300, '300g': 360 },
  custom: { '130g': 300, '170g': 360, '300g': 420 },
};

const finishPrices: Record<Finish, number> = {
  'laminare-lucioasa': 40,
  'laminare-mata': 45,
  'colturi-rotunjite': 25,
  perforare: 35,
  pliere: 50,
};

const productionMultiplier: Record<ProductionSpeed, number> = {
  standard: 1,
  express: 1.18,
  'super-express': 1.32,
};

export function usePriceCalculator() {
  const calcBasePrice = (dimension: Dimension, material: Material) => {
    return basePrices[dimension]?.[material] ?? 0;
  };

  const calcFinishPrice = (finishes: Finish[]) => {
    return finishes.reduce((sum, finish) => sum + (finishPrices[finish] ?? 0), 0);
  };

  const calcQuantityPrice = (quantity: number, base: number) => {
    const normalizedQty = Math.max(1, quantity);
    const scale = Math.max(1, Math.ceil(normalizedQty / 100));
    const discountFactor = normalizedQty >= 1000 ? 0.9 : normalizedQty >= 500 ? 0.94 : normalizedQty >= 250 ? 0.97 : 1;
    return base * scale * discountFactor;
  };

  const calcProductionSpeedPrice = (productionSpeed: ProductionSpeed, subtotal: number) => {
    return subtotal * (productionMultiplier[productionSpeed] - 1);
  };

  const calcTotal = (selection: PriceSelection): PriceBreakdown => {
    const base = calcBasePrice(selection.dimension, selection.material);
    const finishes = calcFinishPrice(selection.finishes);
    const qtyPrice = calcQuantityPrice(selection.quantity, base + finishes);
    const subtotal = qtyPrice;
    const production = calcProductionSpeedPrice(selection.productionSpeed, subtotal);
    const total = Math.max(0, subtotal + production);

    // Simple promo: if quantity >= 1000 and dimension not custom → 5% savings
    const savings = selection.quantity >= 1000 && selection.dimension !== 'custom' ? total * 0.05 : 0;
    const finalTotal = total - savings;

    return {
      base,
      finishes,
      quantity: qtyPrice,
      production,
      total: Number(finalTotal.toFixed(2)),
      savings: savings ? Number(savings.toFixed(2)) : undefined,
    };
  };

  return {
    calcBasePrice,
    calcFinishPrice,
    calcQuantityPrice,
    calcProductionSpeedPrice,
    calcTotal,
  };
}
