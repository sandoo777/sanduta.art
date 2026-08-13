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
  jobTimeHours?: number | null;
  laborJobTimeHours?: number | null;
  laborRatePerHour?: number | null;
  costConsumables?: number | null;
  marginPercent?: number | null;
  equipment?: {
    costPerHour?: number | null;
  } | null;
}

export interface ConsumptionPricingResult {
  unitPrice: number;
  effectiveWastePercent: number;
  totalUsed: number;
  costMaterial: number;
  costConsumables: number;
  costEquipment: number;
  costLabor: number;
  baseCost: number;
  margin: number;
  priceFinal: number;
  totalCost: number;
  snapshot: {
    costMaterial: number;
    costConsumables: number;
    costEquipment: number;
    costLabor: number;
    baseCost: number;
    margin: number;
    priceFinal: number;
  };
}

interface PricingValidationParams {
  jobTimeHours: number;
  equipment: {
    costPerHour: number;
  };
  labor: {
    ratePerHour: number;
  };
  laborRatePerHour?: number;
  marginPercent: number;
  costMaterial: number;
  costConsumables: number;
}

const DIRECT_DEFAULT_UNITS = [
  MaterialUnit.liter,
  MaterialUnit.ml,
  MaterialUnit.gram,
  MaterialUnit.kg,
  MaterialUnit.unit,
  MaterialUnit.pcs,
  MaterialUnit.sheet,
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
  [MaterialUnit.sheet]: 'count',
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
  [MaterialUnit.sheet]: 1,
};

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

export function calculateEquipmentCost(
  equipment: { costPerHour?: number | null } | null | undefined,
  jobTimeHours: number
): number {
  const costPerHour = equipment?.costPerHour ?? 0;
  return costPerHour * jobTimeHours;
}

export function calculateLaborCost(laborRatePerHour: number | null | undefined, jobTimeHours: number): number {
  const rate = laborRatePerHour ?? 0;
  return rate * jobTimeHours;
}

export function calculateMargin(basePrice: number, marginPercent: number | null | undefined): number {
  const percent = marginPercent ?? 0;
  return basePrice * (percent / 100);
}

function validatePricing(_input: ConsumptionPricingInput, pricingParams: PricingValidationParams): void {
  const jobTimeHoursSafe = _input.jobTimeHours ?? 0;
  const equipmentCostPerHourSafe = pricingParams?.equipment?.costPerHour ?? 0;
  const laborRateSafe = pricingParams?.laborRatePerHour ?? pricingParams?.labor?.ratePerHour ?? 0;
  const marginPercentSafe = pricingParams?.marginPercent ?? 0;

  if (jobTimeHoursSafe < 0) {
    throw 'jobTimeHours trebuie să fie >= 0';
  }

  if (equipmentCostPerHourSafe < 0) {
    throw 'equipment.costPerHour trebuie să fie >= 0';
  }

  if (laborRateSafe < 0) {
    throw 'labor.ratePerHour trebuie să fie >= 0';
  }

  if (marginPercentSafe < 0 || marginPercentSafe > 100) {
    throw 'marginPercent trebuie să fie între 0 și 100';
  }

  if (pricingParams.costMaterial < 0 || pricingParams.costConsumables < 0) {
    throw 'costMaterial și costConsumables trebuie să fie >= 0';
  }
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
  const jobTimeHours = input.jobTimeHours ?? 0;
  const laborJobTimeHours = input.laborJobTimeHours ?? jobTimeHours;
  const rawCostMaterial = totalCost;
  const rawCostConsumables = input.costConsumables ?? 0;

  validatePricing(input, {
    jobTimeHours,
    equipment: {
      costPerHour: input.equipment?.costPerHour ?? 0,
    },
    labor: {
      ratePerHour: input.laborRatePerHour ?? 0,
    },
    laborRatePerHour: input.laborRatePerHour ?? 0,
    marginPercent: input.marginPercent ?? 0,
    costMaterial: rawCostMaterial,
    costConsumables: rawCostConsumables,
  });

  const costMaterial = totalCost;
  const costConsumables = input.costConsumables ?? 0;
  const costEquipment = calculateEquipmentCost(input.equipment, jobTimeHours);
  const costLabor = calculateLaborCost(input.laborRatePerHour, laborJobTimeHours);
  const marginPercent = input.marginPercent;

  const costMaterialR = round(costMaterial, 2);
  const costConsumablesR = round(costConsumables, 2);
  const costEquipmentR = round(costEquipment ?? 0, 2);
  const costLaborR = round(costLabor ?? 0, 2);
  const baseCostR = round(costMaterialR + costConsumablesR + costEquipmentR + costLaborR, 2);
  const marginR = round(calculateMargin(baseCostR, marginPercent ?? 0), 2);
  const priceFinalR = round(baseCostR + marginR, 2);
  const snapshot = {
    costMaterial: costMaterialR,
    costConsumables: costConsumablesR,
    costEquipment: costEquipmentR,
    costLabor: costLaborR,
    baseCost: baseCostR,
    margin: marginR,
    priceFinal: priceFinalR,
  };

  snapshot.baseCost = baseCostR;
  snapshot.margin = marginR;
  snapshot.priceFinal = priceFinalR;

  return {
    unitPrice,
    effectiveWastePercent,
    totalUsed,
    costMaterial: costMaterialR,
    costConsumables: costConsumablesR,
    costEquipment: costEquipmentR,
    costLabor: costLaborR,
    baseCost: baseCostR,
    margin: marginR,
    priceFinal: priceFinalR,
    totalCost: costMaterialR,
    snapshot,
  };
}
export { MaterialUnit, convertMaterialQuantity, getAllowedUnitsForMaterialType } from './materialUnits';
