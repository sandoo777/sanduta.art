import { describe, expect, it } from 'vitest';
import { previewMaterial } from '@/modules/materials/server';

describe('materials preview', () => {
  it('calculates FOI preview and autoName', () => {
    const result = previewMaterial({
      materialType: 'SUPORT_FOI',
      width_mm: 210,
      height_mm: 297,
      unit: 'mm',
      consumptionRate: 0,
    });

    expect(result.ok).toBe(true);
    expect(result.preview.area_m2).toBeCloseTo(0.06237, 5);
    expect(result.preview.autoName).toBe('210x297 mm');
  });

  it('calculates ROLE preview with length', () => {
    const result = previewMaterial({
      materialType: 'SUPORT_ROLA',
      width_mm: 420,
      unit: 'm',
      length_mm: 2500,
      consumptionRate: 0,
    });

    expect(result.ok).toBe(true);
    expect(result.preview.length_m).toBeCloseTo(2.5, 5);
    expect(result.preview.autoName).toBe('420 mm');
  });

  it('calculates CERNEALA consumption using mL per m2', () => {
    const result = previewMaterial({
      materialType: 'CERNEALA',
      width_mm: 210,
      height_mm: 297,
      unit: 'mL',
      consumptionRate: 12,
    });

    expect(result.ok).toBe(true);
    expect(result.preview.estimated_consumption).toMatchObject({ unit: 'L', value: expect.any(Number) });
    expect(result.preview.estimated_consumption.value).toBeGreaterThan(0);
  });

  it('returns structured validation errors', () => {
    const result = previewMaterial({
      materialType: 'SUPORT_FOI',
      width_mm: 0,
      height_mm: 0,
      unit: 'cm',
      consumptionRate: 0,
    });

    expect(result.ok).toBe(false);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'width_mm' }),
      expect.objectContaining({ field: 'unit' }),
    ]));
  });
});
