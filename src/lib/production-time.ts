/**
 * Helper pentru calculul timpului estimat de producție.
 * Pur (fără efecte secundare), utilizabil atât pe server cât și pe client.
 */

import { resolveColorModeSpeedFactor } from '@/modules/print-methods/colorModes';
import { isDigitalEquipmentType, isLargeFormatEquipmentType, normalizeEquipmentType } from '@/modules/machines/types';
import { DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS, type GlobalProductionCostSettings } from '@/lib/global-cost-settings';

export type EquipmentTypeForCalc =
  | 'DIGITAL_COLOR'
  | 'DIGITAL_MONO'
  | 'UV'
  | 'LARGE_FORMAT'
  | 'DTF'
  | 'SUBLIMATION'
  | 'OFFSET'
  | 'EMBROIDERY'
  | 'PLOTTER_CUTTING'
  | 'DIGITAL'
  | 'HOURLY';

export interface EquipmentForCalc {
  id: string;
  name: string;
  equipmentType: EquipmentTypeForCalc;
  /** m²/h — pentru LARGE_FORMAT */
  speedM2PerHour: number | null;
  /** pagini pe minut — pentru DIGITAL */
  speedPpm: number | null;
}

export interface JobParamsForCalc {
  /** m² pentru LARGE_FORMAT, pagini pentru DIGITAL, ore pentru HOURLY */
  quantity: number;
  colorMode?: string | null;
}

export interface ProductionTimeResult {
  estimatedMinutes: number;
  /** Explicație human-readable a calculului */
  breakdown: string;
}

/**
 * Calculează timpul estimat de producție în minute.
 * Aruncă Error cu mesaj clar dacă lipsesc datele necesare.
 */
export function calculateProductionTime(
  equipment: EquipmentForCalc,
  job: JobParamsForCalc,
): ProductionTimeResult {
  const normalizedType = normalizeEquipmentType(equipment.equipmentType);
  const { speedM2PerHour, speedPpm, name } = equipment;
  const { quantity, colorMode } = job;
  const speedFactor = resolveColorModeSpeedFactor(colorMode);

  if (!quantity || quantity <= 0) {
    throw new Error('Cantitatea trebuie să fie mai mare decât zero');
  }

  if (isLargeFormatEquipmentType(normalizedType)) {
    if (!speedM2PerHour || speedM2PerHour <= 0) {
      throw new Error(`Echipamentul "${name}" nu are viteza (m²/h) configurată`);
    }
    const effectiveSpeed = speedM2PerHour * speedFactor;
    if (effectiveSpeed <= 0) {
      throw new Error(`Factorul de viteză pentru mod culoare este invalid (${speedFactor})`);
    }
    const hours = quantity / effectiveSpeed;
    const estimatedMinutes = Math.ceil(hours * 60);
    return {
      estimatedMinutes,
      breakdown: `${quantity} m² ÷ (${speedM2PerHour} m²/h × ${speedFactor.toFixed(2)}) = ${hours.toFixed(2)} h`,
    };
  }

  if (isDigitalEquipmentType(normalizedType)) {
    if (!speedPpm || speedPpm <= 0) {
      throw new Error(`Echipamentul "${name}" nu are viteza de tipărire (ppm) configurată`);
    }
    const effectiveSpeed = speedPpm * speedFactor;
    if (effectiveSpeed <= 0) {
      throw new Error(`Factorul de viteză pentru mod culoare este invalid (${speedFactor})`);
    }
    const minutes = quantity / effectiveSpeed;
    const estimatedMinutes = Math.ceil(minutes);
    return {
      estimatedMinutes,
      breakdown: `${quantity} pag. ÷ (${speedPpm} ppm × ${speedFactor.toFixed(2)}) = ${minutes.toFixed(2)} min`,
    };
  }

  const estimatedMinutes = Math.ceil(quantity * 60);
  return {
    estimatedMinutes,
    breakdown: `${quantity} h × 60 = ${estimatedMinutes} min`,
  };
}

/** Formatare durate: 45 → "45 min", 90 → "1h 30min", 120 → "2h" */
export function formatProductionTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/** Label câmp cantitate în funcție de tipul echipamentului */
export function getQuantityLabel(equipmentType: string): string {
  const normalizedType = normalizeEquipmentType(equipmentType);

  if (isLargeFormatEquipmentType(normalizedType)) return 'Suprafață de tipărit (m²)';
  if (isDigitalEquipmentType(normalizedType)) return 'Număr de pagini';
  return 'Durata estimată (ore)';
}

/** Placeholder câmp cantitate */
export function getQuantityPlaceholder(equipmentType: string): string {
  const normalizedType = normalizeEquipmentType(equipmentType);

  if (isLargeFormatEquipmentType(normalizedType)) return 'ex: 10.5';
  if (isDigitalEquipmentType(normalizedType)) return 'ex: 500';
  return 'ex: 2.5';
}

// ─── CALCUL COST ─────────────────────────────────────────────────────────────

export interface EquipmentForCostCalc {
  id: string;
  name: string;
  equipmentType: EquipmentTypeForCalc;
  // LARGE_FORMAT — costuri per m²
  inkPerM2?: number | null;
  materialPerM2?: number | null;
  headAmortPerM2?: number | null;
  printerAmortPerM2?: number | null;
  maintCostPerM2?: number | null;
  // DIGITAL — costuri per click
  costClickColor?: number | null;
  costClickBW?: number | null;
  purchaseCostMdl?: number | null;
  expectedLifetimePages?: number | null;
  electricityCostPerKwh?: number | null;
  powerConsumptionKw?: number | null;
  energyConsumptionKw?: number | null;
  operatorCostPerHour?: number | null;
  speedPpm?: number | null;
  speedProfiles?: Array<{ minWeight: number; maxWeight: number; speedPpm: number }>;
  maintenanceComponents?: Array<{ name: string; cost: number; expectedLifetimePages: number }>;
  tonerConsumables?: Array<{ type: string; cost: number; yieldPages: number }>;
  // HOURLY — cost orar
  costPerHour?: number | null;
  globalCostSettings?: Partial<GlobalProductionCostSettings>;
}

export interface JobParamsForCostCalc {
  /** m² pentru LARGE_FORMAT, pagini color pentru DIGITAL, ore pentru HOURLY */
  quantity: number;
  /** Pagini alb-negru — doar pentru DIGITAL */
  bwPages?: number;
}

export interface ProductionCostResult {
  estimatedCost: number;
  /** Explicație human-readable a calculului */
  breakdown: string;
}

/**
 * Calculează costul estimat de producție.
 * Aruncă Error cu mesaj clar dacă lipsesc datele necesare.
 */
export function calculateDigitalColorCostPerPage(
  equipment: EquipmentForCostCalc,
): number {
  const purchaseCost = equipment.purchaseCostMdl ?? 0;
  const lifetimePages = equipment.expectedLifetimePages ?? 0;
  const equipmentAmortization = lifetimePages > 0 ? purchaseCost / lifetimePages : 0;

  const maintenanceCost = (equipment.maintenanceComponents ?? []).reduce((sum, component) => {
    const lifetime = component.expectedLifetimePages > 0 ? component.expectedLifetimePages : 1;
    return sum + (component.cost / lifetime);
  }, 0);

  const tonerCost = (equipment.tonerConsumables ?? []).reduce((sum, consumable) => {
    const yieldPages = consumable.yieldPages > 0 ? consumable.yieldPages : 1;
    return sum + (consumable.cost / yieldPages);
  }, 0);

  const powerConsumption = equipment.powerConsumptionKw ?? equipment.energyConsumptionKw ?? 0;
  const electricityCostPerKwh = equipment.globalCostSettings?.electricityCostMdlPerKwh ?? equipment.electricityCostPerKwh ?? DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS.electricityCostMdlPerKwh;
  const operatorCostPerHour = equipment.globalCostSettings?.productionOperatorCostMdlPerHour ?? equipment.operatorCostPerHour ?? DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS.productionOperatorCostMdlPerHour;
  const ppm = equipment.speedPpm ?? 0;

  const electricityCostPerHour = powerConsumption * electricityCostPerKwh;
  const pagesPerHour = ppm > 0 ? ppm * 60 : 0;
  const operatorCostPerPage = pagesPerHour > 0 ? operatorCostPerHour / pagesPerHour : 0;
  const electricityCostPerPage = pagesPerHour > 0 ? electricityCostPerHour / pagesPerHour : 0;

  return equipmentAmortization + maintenanceCost + tonerCost + operatorCostPerPage + electricityCostPerPage;
}

export function calculateProductionCost(
  equipment: EquipmentForCostCalc,
  job: JobParamsForCostCalc,
): ProductionCostResult {
  const normalizedType = normalizeEquipmentType(equipment.equipmentType);
  const { name } = equipment;
  const { quantity, bwPages = 0 } = job;

  if (!quantity || quantity <= 0) {
    throw new Error('Cantitatea trebuie să fie mai mare decât zero');
  }

  if (normalizedType === 'DIGITAL_COLOR') {
    const costPerPage = calculateDigitalColorCostPerPage(equipment);
    const estimatedCost = quantity * costPerPage;
    return {
      estimatedCost: Math.round(estimatedCost * 10000) / 10000,
      breakdown: `${quantity} pag. × ${costPerPage.toFixed(4)} RON/pag. (amortizare + mentenanță + toner + operator + electricitate)`,
    };
  }

  if (isLargeFormatEquipmentType(normalizedType)) {
    const ink        = equipment.inkPerM2        ?? null;
    const material   = equipment.materialPerM2   ?? null;
    const headAmort  = equipment.headAmortPerM2  ?? null;
    const printAmort = equipment.printerAmortPerM2 ?? null;
    const maint      = equipment.maintCostPerM2  ?? null;

    const missing: string[] = [];
    if (ink        === null) missing.push('cerneală/m²');
    if (material   === null) missing.push('material/m²');
    if (headAmort  === null) missing.push('amortizare cap/m²');
    if (printAmort === null) missing.push('amortizare imprimantă/m²');
    if (maint      === null) missing.push('mentenanță/m²');

    if (missing.length > 0) {
      throw new Error(
        `Echipamentul "${name}" nu are configurate: ${missing.join(', ')}`,
      );
    }

    const costPerM2 = ink! + material! + headAmort! + printAmort! + maint!;
    const estimatedCost = quantity * costPerM2;
    return {
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      breakdown: `${quantity} m² × ${costPerM2.toFixed(4)} RON/m² (cerneală+material+amort+mentenanță)`,
    };
  }

  if (isDigitalEquipmentType(normalizedType)) {
    const colorCost = equipment.costClickColor ?? null;
    const bwCost    = equipment.costClickBW    ?? null;

    const colorPages = quantity;
    const bwPagesVal = bwPages;

    if (colorPages > 0 && colorCost === null) {
      throw new Error(`Echipamentul "${name}" nu are cost click color configurat`);
    }
    if (bwPagesVal > 0 && bwCost === null) {
      throw new Error(`Echipamentul "${name}" nu are cost click alb-negru configurat`);
    }

    const colorTotal = colorPages * (colorCost ?? 0);
    const bwTotal    = bwPagesVal * (bwCost    ?? 0);
    const estimatedCost = colorTotal + bwTotal;

    const parts: string[] = [];
    if (colorPages > 0) parts.push(`${colorPages} pag. color × ${colorCost} RON`);
    if (bwPagesVal > 0) parts.push(`${bwPagesVal} pag. A/N × ${bwCost} RON`);

    return {
      estimatedCost: Math.round(estimatedCost * 10000) / 10000,
      breakdown: parts.join(' + '),
    };
  }

  const costPerHour = equipment.costPerHour ?? null;
  if (costPerHour === null) {
    throw new Error(`Echipamentul "${name}" nu are costul orar configurat`);
  }
  const estimatedCost = quantity * costPerHour;
  return {
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    breakdown: `${quantity} h × ${costPerHour} RON/h`,
  };
}

/** Formatare sumă monetară: 1234.5 → "1.234,50 RON" */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON`;
}
