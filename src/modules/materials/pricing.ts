import { MaterialUnit } from '@prisma/client';

export type MaterialConsumptionType = 'AREA_BASED' | 'DIRECT';

export interface CategoryUnitRules {
  requiresPricePerSqm: boolean;
  requiresPricePerMeter: boolean;
  requiresPricePerUnit: boolean;
}

export interface ConsumptionPricingInput {
  consumptionType: MaterialConsumptionType;
  purchasePrice: number | null;
  salePrice: number | null;
  wastePercent: number;
}

export interface ConsumptionPricingResult {
  unitPrice: number;
  effectiveWastePercent: number;
  totalUsed: number;
  totalCost: number;
}

const DIRECT_DEFAULT_UNITS = [
  MaterialUnit.liter,
  MaterialUnit.ml,
  MaterialUnit.gram,
  MaterialUnit.kg,
  MaterialUnit.unit,
  MaterialUnit.pcs,
] as const;

const AREA_DEFAULT_UNITS = [
  MaterialUnit.m2,
  MaterialUnit.meter,
  MaterialUnit.unit,
  MaterialUnit.pcs,
] as const;

type UnitGroup = 'volume' | 'mass' | 'length' | 'area' | 'count';

const UNIT_GROUP: Record<MaterialUnit, UnitGroup> = {
  [MaterialUnit.liter]: 'volume',
  [MaterialUnit.ml]: 'volume',
  [MaterialUnit.gram]: 'mass',
  [MaterialUnit.kg]: 'mass',
  [MaterialUnit.unit]: 'count',
  [MaterialUnit.pcs]: 'count',
  [MaterialUnit.m2]: 'area',
  [MaterialUnit.meter]: 'length',
};

const BASE_FACTOR: Record<MaterialUnit, number> = {
  [MaterialUnit.liter]: 1,
  [MaterialUnit.ml]: 0.001,
  [MaterialUnit.kg]: 1,
  [MaterialUnit.gram]: 0.001,
  [MaterialUnit.meter]: 1,
  [MaterialUnit.m2]: 1,
  [MaterialUnit.unit]: 1,
  [MaterialUnit.pcs]: 1,
};

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

export function resolveAllowedUnitsByCategory(
  categoryRules: CategoryUnitRules,
  consumptionType: MaterialConsumptionType
): MaterialUnit[] {
  const preferred = new Set<MaterialUnit>();

  if (categoryRules.requiresPricePerSqm) {
    preferred.add(MaterialUnit.m2);
  }

  if (categoryRules.requiresPricePerMeter) {
    preferred.add(MaterialUnit.meter);
  }

  if (categoryRules.requiresPricePerUnit) {
    preferred.add(MaterialUnit.unit);
    preferred.add(MaterialUnit.pcs);
  }

  if (preferred.size === 0) {
    return consumptionType === 'DIRECT' ? [...DIRECT_DEFAULT_UNITS] : [...AREA_DEFAULT_UNITS];
  }

  if (consumptionType === 'DIRECT') {
    return [...new Set([...DIRECT_DEFAULT_UNITS, ...preferred])];
  }

  return [...new Set([...AREA_DEFAULT_UNITS, ...preferred])];
}

export function convertMaterialQuantity(
  quantity: number,
  fromUnit: MaterialUnit,
  toUnit: MaterialUnit,
  options: { rollWidthMeters?: number } = {}
): number {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error('Quantity must be a non-negative finite number');
  }

  if (fromUnit === toUnit) {
    return quantity;
  }

  if ((fromUnit === MaterialUnit.unit && toUnit === MaterialUnit.pcs) || (fromUnit === MaterialUnit.pcs && toUnit === MaterialUnit.unit)) {
    return quantity;
  }

  if ((fromUnit === MaterialUnit.m2 && toUnit === MaterialUnit.meter) || (fromUnit === MaterialUnit.meter && toUnit === MaterialUnit.m2)) {
    const rollWidthMeters = options.rollWidthMeters ?? 1;
    if (!Number.isFinite(rollWidthMeters) || rollWidthMeters <= 0) {
      throw new Error('rollWidthMeters must be a positive number');
    }

    return fromUnit === MaterialUnit.m2
      ? quantity / rollWidthMeters
      : quantity * rollWidthMeters;
  }

  const fromGroup = UNIT_GROUP[fromUnit];
  const toGroup = UNIT_GROUP[toUnit];

  if (fromGroup !== toGroup) {
    throw new Error(`Cannot convert between ${fromUnit} and ${toUnit}`);
  }

  const inBase = quantity * BASE_FACTOR[fromUnit];
  return inBase / BASE_FACTOR[toUnit];
}

export function calculateConsumptionCost(
  consumedQuantity: number,
  input: ConsumptionPricingInput
): ConsumptionPricingResult {
  if (!Number.isFinite(consumedQuantity) || consumedQuantity <= 0) {
    throw new Error('Consumed quantity must be a positive number');
  }

  const unitPrice = input.salePrice ?? input.purchasePrice;
  if (unitPrice == null || !Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error('A valid unit price (sale or purchase) is required');
  }

  if (input.consumptionType === 'DIRECT' && input.salePrice == null && input.purchasePrice == null) {
    throw new Error('Direct consumption requires price configuration');
  }

  const effectiveWastePercent = Number.isFinite(input.wastePercent)
    ? Math.min(Math.max(input.wastePercent, 0), 100)
    : 0;

  const totalUsed = consumedQuantity * (1 + effectiveWastePercent / 100);
  const totalCost = totalUsed * unitPrice;

  return {
    unitPrice,
    effectiveWastePercent,
    totalUsed,
    totalCost: roundCurrency(totalCost),
  };
}
