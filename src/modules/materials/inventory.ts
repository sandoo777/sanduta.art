export type InventoryUnit =
  | 'm2'
  | 'meter'
  | 'm'
  | 'ml'
  | 'liter'
  | 'l'
  | 'g'
  | 'kg'
  | 'unit'
  | 'buc'
  | 'pcs'
  | 'sheet';

export interface InventoryCalculationInput {
  materialType?: string | null;
  width_mm?: number | null;
  height_mm?: number | null;
  length_mm?: number | null;
  quantity?: number | null;
  unit?: string | null;
  consumptionRate?: number | null;
}

export interface InventoryCalculationResult {
  consumed: number;
  unit: string;
  area_m2: number | null;
  length_m: number | null;
}

export function normalizeMaterialUnit(value?: string | null): string {
  if (!value) return 'unit';
  const raw = value.trim().toLowerCase();
  const aliasMap: Record<string, string> = {
    sqm: 'm2',
    m2: 'm2',
    'm²': 'm2',
    meter: 'meter',
    metres: 'meter',
    'm': 'meter',
    ml: 'ml',
    milliliter: 'ml',
    liter: 'liter',
    litre: 'liter',
    l: 'liter',
    gram: 'g',
    grams: 'g',
    g: 'g',
    kg: 'kg',
    kilo: 'kg',
    unit: 'unit',
    buc: 'unit',
    pcs: 'unit',
    piece: 'unit',
    sheet: 'sheet',
  };
  return aliasMap[raw] ?? raw;
}

export function toAreaM2(width_mm: number, height_mm: number): number {
  if (!Number.isFinite(width_mm) || !Number.isFinite(height_mm)) {
    throw new Error('Both width and height must be finite numbers');
  }
  if (width_mm <= 0 || height_mm <= 0) {
    throw new Error('Width and height must be positive');
  }
  return (width_mm * height_mm) / 1_000_000;
}

export function toLengthM(length_mm: number): number {
  if (!Number.isFinite(length_mm)) {
    throw new Error('length_mm must be a finite number');
  }
  if (length_mm <= 0) {
    throw new Error('length_mm must be positive');
  }
  return length_mm / 1000;
}

export function convertUnit(value: number, fromUnit?: string | null, toUnit?: string | null): number {
  if (!Number.isFinite(value)) {
    throw new Error('Value must be a finite number');
  }
  const from = normalizeMaterialUnit(fromUnit);
  const to = normalizeMaterialUnit(toUnit);

  if (from === to) return value;

  const lengthMap: Record<string, number> = { meter: 1, m: 1, mm: 0.001, cm: 0.01 };
  const volumeMap: Record<string, number> = { liter: 1, l: 1, ml: 0.001, g: 0.001, kg: 1 };
  const countMap: Record<string, number> = { unit: 1, buc: 1, pcs: 1, sheet: 1 };

  if (from in lengthMap && to in lengthMap) {
    return (value * lengthMap[from]) / lengthMap[to];
  }

  if (from in volumeMap && to in volumeMap) {
    return (value * volumeMap[from]) / volumeMap[to];
  }

  if (from in countMap && to in countMap) {
    return value;
  }

  if ((from === 'm2' || from === 'sqm') && (to === 'meter' || to === 'm')) {
    throw new Error('m2 to meter conversion requires width in mm and is handled by the material usage calculator');
  }

  if ((from === 'meter' || from === 'm') && (to === 'm2' || to === 'sqm')) {
    throw new Error('meter to m2 conversion requires width in mm and is handled by the material usage calculator');
  }

  throw new Error(`Unsupported conversion from ${fromUnit ?? 'unknown'} to ${toUnit ?? 'unknown'}`);
}

export function calculateMaterialConsumption(input: InventoryCalculationInput): InventoryCalculationResult {
  const materialType = input.materialType ?? 'SUPORT_FOI';
  const unit = normalizeMaterialUnit(input.unit ?? 'unit');
  const widthMm = Number(input.width_mm ?? 0);
  const heightMm = Number(input.height_mm ?? 0);
  const lengthMm = Number(input.length_mm ?? 0);
  const quantity = Number(input.quantity ?? 0);

  if (materialType === 'SUPORT_FOI') {
    const decisiveArea = widthMm > 0 && heightMm > 0 ? toAreaM2(widthMm, heightMm) : 0;
    const count = quantity > 0 ? quantity : 1;
    return {
      consumed: decisiveArea * count,
      unit: 'm2',
      area_m2: decisiveArea * count,
      length_m: null,
    };
  }

  if (materialType === 'SUPORT_ROLA') {
    const widthM = widthMm > 0 ? widthMm / 1000 : 0;
    const effectiveLengthM = lengthMm > 0 ? toLengthM(lengthMm) : quantity > 0 ? quantity : 0;
    const areaBased = widthM > 0 && effectiveLengthM > 0 ? effectiveLengthM * widthM : 0;

    if (unit === 'meter' || unit === 'm') {
      return {
        consumed: effectiveLengthM,
        unit: 'meter',
        area_m2: null,
        length_m: effectiveLengthM,
      };
    }

    return {
      consumed: areaBased,
      unit: 'm2',
      area_m2: areaBased,
      length_m: effectiveLengthM,
    };
  }

  if (materialType === 'CERNEALA') {
    const area = widthMm > 0 && heightMm > 0 ? toAreaM2(widthMm, heightMm) : 0;
    const rate = Number(input.consumptionRate ?? 0);
    const consumed = area * rate;
    return {
      consumed,
      unit: unit === 'liter' || unit === 'l' ? 'liter' : unit === 'ml' ? 'ml' : 'liter',
      area_m2: area,
      length_m: null,
    };
  }

  if (materialType === 'CONSUMABIL') {
    const consumed = quantity > 0 ? quantity : 0;
    return {
      consumed,
      unit: unit === 'unit' || unit === 'buc' || unit === 'pcs' ? 'unit' : unit,
      area_m2: null,
      length_m: null,
    };
  }

  const consumed = quantity > 0 ? quantity : 0;
  return {
    consumed,
    unit,
    area_m2: widthMm > 0 && heightMm > 0 ? toAreaM2(widthMm, heightMm) : null,
    length_m: lengthMm > 0 ? toLengthM(lengthMm) : null,
  };
}

export function buildInventoryError(field: string, message: string) {
  return { field, message };
}
