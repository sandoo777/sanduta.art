import { describe, expect, it } from 'vitest';
import { MaterialUnit } from '@prisma/client';
import {
  calculateConsumptionCost,
  convertMaterialQuantity,
  resolveAllowedUnitsByCategory,
} from '@/modules/materials/pricing';

describe('materials pricing - convertMaterialQuantity', () => {
  it('converts gram to kg', () => {
    expect(convertMaterialQuantity(2500, MaterialUnit.gram, MaterialUnit.kg)).toBeCloseTo(2.5, 5);
  });

  it('converts ml to liter', () => {
    expect(convertMaterialQuantity(1500, MaterialUnit.ml, MaterialUnit.liter)).toBeCloseTo(1.5, 5);
  });

  it('converts m2 to meter using roll width', () => {
    expect(
      convertMaterialQuantity(8, MaterialUnit.m2, MaterialUnit.meter, { rollWidthMeters: 2 })
    ).toBeCloseTo(4, 5);
  });

  it('throws on incompatible units', () => {
    expect(() => convertMaterialQuantity(1, MaterialUnit.kg, MaterialUnit.meter)).toThrow(
      'Cannot convert between kg and meter'
    );
  });
});

describe('materials pricing - calculateConsumptionCost', () => {
  it('applies waste formula with sale price', () => {
    const result = calculateConsumptionCost(10, {
      consumptionType: 'AREA_BASED',
      purchasePrice: 7,
      salePrice: 12,
      wastePercent: 10,
    });

    expect(result.unitPrice).toBe(12);
    expect(result.totalUsed).toBeCloseTo(11, 5);
    expect(result.totalCost).toBeCloseTo(132, 5);
  });

  it('falls back to purchase price when sale price is missing', () => {
    const result = calculateConsumptionCost(3, {
      consumptionType: 'DIRECT',
      purchasePrice: 5,
      salePrice: null,
      wastePercent: 0,
    });

    expect(result.unitPrice).toBe(5);
    expect(result.totalCost).toBeCloseTo(15, 5);
  });

  it('rejects invalid quantity', () => {
    expect(() =>
      calculateConsumptionCost(0, {
        consumptionType: 'DIRECT',
        purchasePrice: 2,
        salePrice: null,
        wastePercent: 0,
      })
    ).toThrow('Consumed quantity must be a positive number');
  });
});

describe('materials pricing - category unit rules', () => {
  it('AREA_BASED category with sqm requirement allows m2', () => {
    const allowed = resolveAllowedUnitsByCategory(
      {
        requiresPricePerSqm: true,
        requiresPricePerMeter: false,
        requiresPricePerUnit: false,
      },
      'AREA_BASED'
    );

    expect(allowed).toContain(MaterialUnit.m2);
    expect(allowed).not.toContain(MaterialUnit.kg);
  });

  it('AREA_BASED category with meter requirement allows meter', () => {
    const allowed = resolveAllowedUnitsByCategory(
      {
        requiresPricePerSqm: false,
        requiresPricePerMeter: true,
        requiresPricePerUnit: false,
      },
      'AREA_BASED'
    );

    expect(allowed).toContain(MaterialUnit.meter);
  });

  it('DIRECT category includes direct units and category-required unit', () => {
    const allowed = resolveAllowedUnitsByCategory(
      {
        requiresPricePerSqm: false,
        requiresPricePerMeter: false,
        requiresPricePerUnit: true,
      },
      'DIRECT'
    );

    expect(allowed).toContain(MaterialUnit.ml);
    expect(allowed).toContain(MaterialUnit.kg);
    expect(allowed).toContain(MaterialUnit.unit);
    expect(allowed).toContain(MaterialUnit.pcs);
  });
});
