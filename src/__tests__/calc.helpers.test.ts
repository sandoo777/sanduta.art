import { describe, expect, it } from 'vitest';
import { calculateMaterialConsumption, toAreaM2, toLengthM } from '@/modules/materials/inventory';

describe('inventory calculation helpers', () => {
  it('calculates FOI area in m2', () => {
    expect(toAreaM2(210, 297)).toBeCloseTo(0.06237, 5);
  });

  it('calculates ROLE length and area', () => {
    const length = calculateMaterialConsumption({
      materialType: 'SUPORT_ROLA',
      width_mm: 210,
      length_mm: 1000,
      unit: 'meter',
    });

    expect(length.consumed).toBeCloseTo(1, 5);
    expect(length.unit).toBe('meter');

    const area = calculateMaterialConsumption({
      materialType: 'SUPORT_ROLA',
      width_mm: 210,
      length_mm: 1000,
      unit: 'm2',
    });

    expect(area.consumed).toBeCloseTo(0.21, 5);
    expect(area.unit).toBe('m2');
  });

  it('calculates CERNEALA consumption using area and rate', () => {
    const result = calculateMaterialConsumption({
      materialType: 'CERNEALA',
      width_mm: 210,
      height_mm: 297,
      unit: 'liter',
      consumptionRate: 0.1,
    });

    expect(result.consumed).toBeCloseTo(0.006237, 6);
    expect(result.unit).toBe('liter');
  });
});
