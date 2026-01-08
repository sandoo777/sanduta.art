import type { DimensionUnit } from '@/modules/configurator/types';

export function convertToMillimeters(value?: number | null, unit: DimensionUnit = 'mm') {
  if (value == null) {
    return undefined;
  }

  switch (unit) {
    case 'cm':
      return value * 10;
    case 'm':
      return value * 1000;
    default:
      return value;
  }
}

export function calculateAreaInSquareMeters(
  width?: number,
  height?: number,
  unit: DimensionUnit = 'mm'
) {
  if (width == null || height == null) {
    return undefined;
  }

  const widthMm = convertToMillimeters(width, unit);
  const heightMm = convertToMillimeters(height, unit);

  if (widthMm == null || heightMm == null) {
    return undefined;
  }

  const areaMm2 = widthMm * heightMm;
  return Number((areaMm2 / 1_000_000).toFixed(4));
}

export function normalizeDimensionSelection(
  dimension?: { width?: number; height?: number; unit?: DimensionUnit },
  fallbackUnit: DimensionUnit = 'mm'
) {
  if (!dimension) {
    return undefined;
  }

  const unit = dimension.unit ?? fallbackUnit;

  return {
    width: dimension.width,
    height: dimension.height,
    unit,
  };
}
