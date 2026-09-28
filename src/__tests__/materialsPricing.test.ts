import { describe, expect, it } from 'vitest';
import { MaterialUnit } from '@prisma/client';
import {
  calculateConsumptionCost,
  convertMaterialQuantity,
  getMaterialPrice,
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

  it('uses price break when quantity falls into configured range', () => {
    const result = calculateConsumptionCost(60, {
      consumptionType: 'DIRECT',
      purchasePrice: 5,
      salePrice: 12,
      wastePercent: 0,
      priceBreaks: [
        { qtyMin: 1, qtyMax: 49, price: 12, discount: null },
        { qtyMin: 50, qtyMax: 100, price: 10, discount: 10 },
      ],
    });

    expect(result.unitPrice).toBeCloseTo(9, 5);
    expect(result.totalCost).toBeCloseTo(540, 5);
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

describe('materials pricing - getMaterialPrice', () => {
  it('returns matching price break with discount-adjusted final price', () => {
    const matched = getMaterialPrice(
      {
        priceBreaks: [
          { qtyMin: 1, qtyMax: 10, price: 25, discount: null },
          { qtyMin: 11, qtyMax: 100, price: 20, discount: 15 },
        ],
      },
      20
    );

    expect(matched).toEqual(
      expect.objectContaining({
        qtyMin: 11,
        qtyMax: 100,
        price: 20,
        discount: 15,
        finalPrice: 17,
      })
    );
  });

  it('returns null when no range matches', () => {
    const matched = getMaterialPrice(
      {
        priceBreaks: [{ qtyMin: 11, qtyMax: 100, price: 20, discount: 15 }],
      },
      5
    );

    expect(matched).toBeNull();
  });

  describe('open-ended last tier', () => {
    const priceBreaks = [
      { qtyMin: 2500, qtyMax: 4999, price: 100, discount: 10 },
      { qtyMin: 5000, qtyMax: null, price: 100, discount: 15 },
    ];

    it('matches the open-ended tier at its exact minimum boundary (qty 5000)', () => {
      const matched = getMaterialPrice({ priceBreaks }, 5000);

      expect(matched).toEqual(
        expect.objectContaining({ qtyMin: 5000, qtyMax: null, discount: 15, finalPrice: 85 })
      );
    });

    it('matches the open-ended tier at qty 9999', () => {
      const matched = getMaterialPrice({ priceBreaks }, 9999);

      expect(matched).toEqual(expect.objectContaining({ qtyMin: 5000, discount: 15 }));
    });

    it('matches the open-ended tier at qty 10000', () => {
      const matched = getMaterialPrice({ priceBreaks }, 10000);

      expect(matched).toEqual(expect.objectContaining({ qtyMin: 5000, discount: 15 }));
    });

    it('matches the open-ended tier at qty 15000 (acceptance test)', () => {
      const matched = getMaterialPrice({ priceBreaks }, 15000);

      expect(matched).not.toBeNull();
      expect(matched).toEqual(
        expect.objectContaining({ qtyMin: 5000, qtyMax: null, discount: 15, finalPrice: 85 })
      );
    });

    it('matches the open-ended tier at a very large qty 50000', () => {
      const matched = getMaterialPrice({ priceBreaks }, 50000);

      expect(matched).toEqual(expect.objectContaining({ qtyMin: 5000, discount: 15 }));
    });

    it('still uses the bounded tier below the open-ended threshold', () => {
      const matched = getMaterialPrice({ priceBreaks }, 3000);

      expect(matched).toEqual(expect.objectContaining({ qtyMin: 2500, qtyMax: 4999, discount: 10 }));
    });
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
