export enum MaterialUnit {
  m2 = 'm2',
  kg = 'kg',
  meter = 'meter',
  ml = 'ml',
  unit = 'unit',
  pcs = 'pcs',
  gram = 'gram',
  liter = 'liter'
}

export function convertMaterialQuantity(
  value: number,
  from: MaterialUnit,
  to: MaterialUnit,
  opts?: { rollWidthMeters?: number }
): number {
  if (from === to) return value;
  if (from === MaterialUnit.gram && to === MaterialUnit.kg) return value / 1000;
  if (from === MaterialUnit.kg && to === MaterialUnit.gram) return value * 1000;
  if (from === MaterialUnit.ml && to === MaterialUnit.liter) return value / 1000;
  if (from === MaterialUnit.liter && to === MaterialUnit.ml) return value * 1000;
  if (from === MaterialUnit.m2 && to === MaterialUnit.meter) {
    const w = opts?.rollWidthMeters;
    if (!w || w <= 0) throw new Error('rollWidthMeters is required for m2 -> meter');
    return value / w;
  }
  if (from === MaterialUnit.meter && to === MaterialUnit.m2) {
    const w = opts?.rollWidthMeters;
    if (!w || w <= 0) throw new Error('rollWidthMeters is required for meter -> m2');
    return value * w;
  }
  const countUnits = new Set([MaterialUnit.unit, MaterialUnit.pcs]);
  if (countUnits.has(from) && countUnits.has(to)) return value;
  throw new Error(Incompatible conversion from  to );
}

export function getAllowedUnitsForMaterialType(materialType: string): MaterialUnit[] {
  switch (materialType) {
    case 'liquid':
      return [MaterialUnit.ml, MaterialUnit.liter, MaterialUnit.unit, MaterialUnit.pcs];
    case 'roll':
      return [MaterialUnit.m2, MaterialUnit.meter];
    case 'solid':
      return [MaterialUnit.kg, MaterialUnit.gram, MaterialUnit.unit, MaterialUnit.pcs];
    case 'consumable':
      return [MaterialUnit.unit, MaterialUnit.pcs, MaterialUnit.ml, MaterialUnit.liter];
    default:
      return Object.values(MaterialUnit);
  }
}
