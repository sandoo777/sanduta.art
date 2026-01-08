import type {
  ConfiguratorFinishing,
  ConfiguratorMaterial,
  ConfiguratorPriceSummary,
  ConfiguratorPrintMethod,
  ConfiguratorProduct,
  ConfiguratorSelections,
} from '@/modules/configurator/types';
import { calculateAreaInSquareMeters } from '@/lib/configurator/dimensions';

export interface PriceCalculationContext {
  material?: ConfiguratorMaterial;
  printMethod?: ConfiguratorPrintMethod;
  finishing?: ConfiguratorFinishing[];
  optionPriceAdjustments?: number;
}

export interface ExtendedPriceSummary extends ConfiguratorPriceSummary {
  breakdown: {
    optionValueCost: number;
    ruleAdjustment: number;
    materialMultiplier: number;
    pricingMethod?: string;
    appliedBreak?: {
      minQuantity: number;
      maxQuantity: number | null;
      pricePerUnit: number;
    };
    areaInSquareMeters?: number;
  };
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function computeMaterialMultiplier(material?: ConfiguratorMaterial) {
  if (!material) {
    return { basis: 'quantity' as const, multiplier: 1 };
  }

  const unit = material.unit.toLowerCase();
  if (unit.includes('m2') || unit.includes('sqm') || unit.includes('mp')) {
    return { basis: 'area' as const, multiplier: 1 };
  }

  return { basis: 'quantity' as const, multiplier: 1 };
}

function computeMaterialCost(
  material: ConfiguratorMaterial | undefined,
  quantity: number,
  area?: number
) {
  if (!material) {
    return { cost: 0, multiplier: 0 };
  }

  const { basis } = computeMaterialMultiplier(material);
  const effectiveModifier = material.priceModifier ?? 0;
  const unitCost = material.costPerUnit + effectiveModifier;

  if (basis === 'area' && area) {
    return { cost: round(unitCost * area), multiplier: area };
  }

  return { cost: round(unitCost * quantity), multiplier: quantity };
}

function computePrintCost(
  method: ConfiguratorPrintMethod | undefined,
  quantity: number,
  area?: number
) {
  if (!method) {
    return 0;
  }

  const areaCost = method.costPerM2 && area ? method.costPerM2 * area : 0;
  const sheetCost = method.costPerSheet ? method.costPerSheet * quantity : 0;
  return round(areaCost + sheetCost);
}

function computeFinishingCost(
  finishing: ConfiguratorFinishing[] | undefined,
  quantity: number,
  area?: number
) {
  if (!finishing?.length) {
    return 0;
  }

  const total = finishing.reduce((sum, operation) => {
    const fix = operation.costFix ?? 0;
    const perUnit = (operation.costPerUnit ?? 0) * quantity;
    const perArea = operation.costPerM2 && area ? operation.costPerM2 * area : 0;
    const modifier = operation.priceModifier ?? 0;
    return sum + fix + perUnit + perArea + modifier;
  }, 0);

  return round(total);
}

function evaluateFormula(
  formula: string | undefined,
  variables: Record<string, number>
) {
  if (!formula) {
    return undefined;
  }

  const tokensPattern = /[A-Z_]+/g;
  const sanitized = formula.replace(tokensPattern, (token) => {
    const upper = token.toUpperCase();
    return Number.isFinite(variables[upper]) ? String(variables[upper]) : '0';
  });

  if (/[^0-9+\-/*().\s]/.test(sanitized)) {
    return undefined;
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${sanitized});`);
    const value = fn();
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  } catch (error) {
    console.warn('Failed to evaluate pricing formula', error);
    return undefined;
  }
}

function computeOptionValueCost(
  product: ConfiguratorProduct,
  selections: ConfiguratorSelections
) {
  return product.options.reduce((sum, option) => {
    const selectedValue = selections.options?.[option.id];
    if (!selectedValue) {
      return sum;
    }

    if (option.type === 'checkbox') {
      const values = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
      const modifier = values.reduce((acc, value) => {
        const match = option.values.find((entry) => entry.value === value);
        return acc + (match?.priceModifier ?? 0);
      }, 0);
      return sum + modifier;
    }

    const value = option.values.find((entry) => entry.value === selectedValue);
    return sum + (value?.priceModifier ?? 0);
  }, 0);
}

export function calculateProductPrice(
  product: ConfiguratorProduct,
  selections: ConfiguratorSelections,
  context: PriceCalculationContext = {}
): ExtendedPriceSummary {
  const quantity = Math.max(1, selections.quantity || 1);
  const dimensionUnit = selections.dimension?.unit ?? product.dimensions?.unit ?? 'mm';
  const area = calculateAreaInSquareMeters(
    selections.dimension?.width,
    selections.dimension?.height,
    dimensionUnit
  );

  const pricing = product.pricing;
  const sortedBreaks = [...(pricing.priceBreaks ?? [])].sort(
    (a, b) => (b.minQuantity ?? 0) - (a.minQuantity ?? 0)
  );
  const appliedPriceBreak = sortedBreaks.find(
    (breakpoint) =>
      quantity >= breakpoint.minQuantity &&
      (breakpoint.maxQuantity == null || quantity <= breakpoint.maxQuantity)
  );

  const unitBase = appliedPriceBreak
    ? appliedPriceBreak.pricePerUnit
    : pricing.basePrice;

  const materialCost = computeMaterialCost(context.material, quantity, area);
  const printCost = computePrintCost(context.printMethod, quantity, area);
  const finishingCost = computeFinishingCost(context.finishing, quantity, area);
  const optionValueCost = computeOptionValueCost(product, selections);
  const optionRuleCost = context.optionPriceAdjustments ?? 0;
  const optionCost = round(optionValueCost + optionRuleCost);

  const variables = {
    BASE: unitBase,
    QTY: quantity,
    AREA: area ?? 1,
    MATERIAL_COST: materialCost.cost,
    PRINT_COST: printCost,
    FINISH_COST: finishingCost,
    OPTION_COST: optionCost,
  } satisfies Record<string, number>;

  let base = unitBase;
  switch (pricing.type) {
    case 'per_unit':
      base = unitBase * quantity;
      break;
    case 'per_sqm':
      base = unitBase * (area ?? 1);
      break;
    case 'per_weight':
      base = unitBase * quantity;
      break;
    case 'formula':
      base = evaluateFormula(pricing.formula, variables) ?? unitBase * quantity;
      break;
    default:
      base = unitBase;
  }

  const subtotal = base + materialCost.cost + printCost + finishingCost + optionCost;

  let discounts = 0;
  if (pricing.discounts?.length) {
    let running = subtotal;
    for (const discount of pricing.discounts) {
      if (discount.minQuantity && quantity < discount.minQuantity) {
        continue;
      }

      if (discount.type === 'percentage') {
        const amount = running * (discount.value / 100);
        discounts += amount;
        running -= amount;
      } else {
        discounts += discount.value;
        running -= discount.value;
      }
    }
  }

  const total = Math.max(0, subtotal - discounts);
  const pricePerUnit = quantity > 0 ? total / quantity : total;

  return {
    base: round(base),
    basePrice: round(base),
    materialCost: materialCost.cost,
    printCost,
    finishingCost,
    optionCost,
    discounts: round(discounts),
    subtotal: round(subtotal),
    total: round(total),
    pricePerUnit: round(pricePerUnit),
    quantity,
    area,
    pricingType: pricing.type,
    appliedPriceBreak: appliedPriceBreak
      ? {
          minQuantity: appliedPriceBreak.minQuantity,
          maxQuantity: appliedPriceBreak.maxQuantity ?? null,
          pricePerUnit: appliedPriceBreak.pricePerUnit,
        }
      : undefined,
    breakdown: {
      optionValueCost: round(optionValueCost),
      ruleAdjustment: round(optionRuleCost),
      materialMultiplier: materialCost.multiplier,
      pricingMethod: pricing.type,
      appliedBreak: appliedPriceBreak
        ? {
            minQuantity: appliedPriceBreak.minQuantity,
            maxQuantity: appliedPriceBreak.maxQuantity ?? null,
            pricePerUnit: appliedPriceBreak.pricePerUnit,
          }
        : undefined,
      areaInSquareMeters: area,
    },
  };
}
