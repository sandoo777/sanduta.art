import { describe, expect, it } from 'vitest';

import { hasMaterialPropForUnit, sanitizeMaterialPayloadByUnit } from '@/config/materialPropsByUnit';

describe('materialPropsByUnit', () => {
  it('exposes expected core visibility rules for major units', () => {
    expect(hasMaterialPropForUnit('m2', 'formatId')).toBe(true);
    expect(hasMaterialPropForUnit('meter', 'height_mm')).toBe(false);
    expect(hasMaterialPropForUnit('sheet', 'formatId')).toBe(true);
    expect(hasMaterialPropForUnit('kg', 'thickness')).toBe(false);
    expect(hasMaterialPropForUnit('liter', 'density')).toBe(true);
    expect(hasMaterialPropForUnit('pcs', 'width_mm')).toBe(true);
    expect(hasMaterialPropForUnit('pcs', 'density')).toBe(true);
  });

  it('sanitizes irrelevant dimension fields for kg-like units', () => {
    const { sanitized, ignoredFields } = sanitizeMaterialPayloadByUnit(
      {
        name: 'Ink',
        unit: 'kg',
        width_mm: 999,
        height_mm: 999,
        thickness: 2,
        density: 1.05,
      },
      'kg'
    );

    expect(ignoredFields).toEqual(expect.arrayContaining(['width_mm', 'height_mm', 'thickness']));
    expect(sanitized).toMatchObject({ unit: 'kg', density: 1.05 });
    expect(sanitized).not.toHaveProperty('width_mm');
    expect(sanitized).not.toHaveProperty('height_mm');
    expect(sanitized).not.toHaveProperty('thickness');
  });

  it('keeps format and dimensions for sheet', () => {
    const { sanitized, ignoredFields } = sanitizeMaterialPayloadByUnit(
      {
        unit: 'sheet',
        formatId: 'fmt-1',
        formatName: 'A4',
        width_mm: 210,
        height_mm: 297,
        thickness: 0.08,
      },
      'sheet'
    );

    expect(ignoredFields).toEqual([]);
    expect(sanitized).toMatchObject({
      unit: 'sheet',
      formatId: 'fmt-1',
      formatName: 'A4',
      width_mm: 210,
      height_mm: 297,
      thickness: 0.08,
    });
  });
});
