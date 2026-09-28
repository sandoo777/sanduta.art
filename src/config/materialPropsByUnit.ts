export type CanonicalMaterialUnit = 'm2' | 'meter' | 'sheet' | 'kg' | 'gram' | 'liter' | 'ml' | 'pcs';

export type UnitScopedMaterialField =
  | 'formatId'
  | 'formatName'
  | 'width_mm'
  | 'height_mm'
  | 'thickness'
  | 'density'
  | 'area_m2'
  | 'consumptionRate'
  | 'packagingLabel'
  | 'packagingQty'
  | 'packagingPrice';

export const materialPropsByUnit: Record<CanonicalMaterialUnit, readonly UnitScopedMaterialField[]> = {
  m2: ['formatId', 'formatName', 'width_mm', 'height_mm', 'thickness', 'density'],
  meter: ['formatId', 'formatName', 'width_mm', 'thickness', 'density'],
  sheet: ['formatId', 'formatName', 'width_mm', 'height_mm', 'thickness', 'density', 'packagingLabel', 'packagingQty', 'packagingPrice'],
  kg: ['density', 'consumptionRate', 'packagingLabel', 'packagingQty', 'packagingPrice'],
  gram: ['density', 'consumptionRate', 'packagingLabel', 'packagingQty', 'packagingPrice'],
  liter: ['density', 'consumptionRate', 'packagingLabel', 'packagingQty', 'packagingPrice'],
  ml: ['density', 'consumptionRate', 'packagingLabel', 'packagingQty', 'packagingPrice'],
  pcs: ['width_mm', 'height_mm', 'thickness', 'density', 'packagingLabel', 'packagingQty', 'packagingPrice'],
};

const UNIT_ALIASES: Record<string, CanonicalMaterialUnit> = {
  m2: 'm2',
  sqm: 'm2',
  meter: 'meter',
  m: 'meter',
  sheet: 'sheet',
  mm: 'sheet',
  kg: 'kg',
  gram: 'gram',
  g: 'gram',
  liter: 'liter',
  l: 'liter',
  ml: 'ml',
  pcs: 'pcs',
  buc: 'pcs',
  piece: 'pcs',
  pieces: 'pcs',
  unit: 'pcs',
};

const UNIT_SCOPED_FIELDS: readonly UnitScopedMaterialField[] = [
  'formatId',
  'formatName',
  'width_mm',
  'height_mm',
  'thickness',
  'density',
  'area_m2',
  'consumptionRate',
  'packagingLabel',
  'packagingQty',
  'packagingPrice',
] as const;

export function toCanonicalMaterialUnit(unit: unknown): CanonicalMaterialUnit | null {
  if (typeof unit !== 'string') return null;
  const normalized = unit.trim().toLowerCase();
  if (!normalized) return null;
  return UNIT_ALIASES[normalized] ?? null;
}

export function hasMaterialPropForUnit(unit: unknown, field: UnitScopedMaterialField): boolean {
  const canonicalUnit = toCanonicalMaterialUnit(unit);
  if (!canonicalUnit) return false;
  return materialPropsByUnit[canonicalUnit].includes(field);
}

export function sanitizeMaterialPayloadByUnit<T extends Record<string, unknown>>(
  payload: T,
  unit: unknown
): { sanitized: T; ignoredFields: string[] } {
  const canonicalUnit = toCanonicalMaterialUnit(unit);
  if (!canonicalUnit) {
    return { sanitized: payload, ignoredFields: [] };
  }

  const allowed = new Set(materialPropsByUnit[canonicalUnit]);
  const next = { ...payload };
  const ignoredFields: string[] = [];

  for (const field of UNIT_SCOPED_FIELDS) {
    if (allowed.has(field)) continue;
    if (next[field] === undefined) continue;

    ignoredFields.push(field);
    delete next[field];
  }

  return { sanitized: next as T, ignoredFields };
}
