import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ConfiguratorProduct, ConfiguratorSelections } from '@/modules/configurator/types';
import { filterMaterialsByProduct } from '@/lib/configurator/filterMaterialsByProduct';
import { filterPrintMethodsByProduct } from '@/lib/configurator/filterPrintMethodsByProduct';
import { filterFinishingByProduct } from '@/lib/configurator/filterFinishingByProduct';
import { applyOptionRules } from '@/lib/configurator/applyOptionRules';
import { calculateProductPrice } from '@/lib/pricing/calculateProductPrice';

describe('Configurator Integration Tests', () => {
  const mockProduct: ConfiguratorProduct = {
    id: 'test-product-1',
    name: 'Test Product',
    slug: 'test-product',
    type: 'CONFIGURABLE',
    description: 'Test product description',
    descriptionShort: 'Short desc',
    defaultImage: '/test.jpg',
    images: [],
    active: true,
    options: [
      {
        id: 'opt-1',
        name: 'Paper Type',
        type: 'select',
        required: true,
        values: [
          { value: 'glossy', label: 'Glossy', priceModifier: 0 },
          { value: 'matte', label: 'Matte', priceModifier: 5 },
        ],
      },
      {
        id: 'opt-2',
        name: 'Extras',
        type: 'checkbox',
        required: false,
        values: [
          { value: 'lamination', label: 'Lamination', priceModifier: 10 },
          { value: 'uv', label: 'UV Coating', priceModifier: 15 },
        ],
      },
    ],
    materials: [
      {
        id: 'mat-1',
        name: 'Standard Paper',
        unit: 'm2',
        costPerUnit: 20,
      },
      {
        id: 'mat-2',
        name: 'Premium Paper',
        unit: 'm2',
        costPerUnit: 30,
        priceModifier: 10,
        constraints: {
          maxWidth: 1000,
          maxHeight: 1000,
          unit: 'mm',
        },
      },
    ],
    printMethods: [
      {
        id: 'pm-1',
        name: 'Digital Print',
        costPerM2: 50,
        maxWidth: 2000,
        maxHeight: 2000,
      },
      {
        id: 'pm-2',
        name: 'Offset Print',
        costPerSheet: 100,
        materialIds: ['mat-1'],
      },
    ],
    finishing: [
      {
        id: 'fin-1',
        name: 'Standard Cut',
        costFix: 5,
      },
      {
        id: 'fin-2',
        name: 'Die Cut',
        costPerUnit: 2,
        compatibleMaterialIds: ['mat-1'],
      },
    ],
    pricing: {
      type: 'fixed',
      basePrice: 100,
      priceBreaks: [
        { minQuantity: 10, maxQuantity: 49, pricePerUnit: 90 },
        { minQuantity: 50, maxQuantity: null, pricePerUnit: 80 },
      ],
    },
    production: {
      leadTimeDays: 5,
      stockQuantity: 100,
    },
    dimensions: {
      widthMin: 100,
      widthMax: 2000,
      heightMin: 100,
      heightMax: 2000,
      unit: 'mm',
    },
    defaults: {
      materialId: 'mat-1',
      printMethodId: 'pm-1',
      finishingIds: ['fin-1'],
      quantity: 1,
      optionValues: {
        'opt-1': 'glossy',
      },
    },
  };

  const baseSelections: ConfiguratorSelections = {
    quantity: 1,
    materialId: 'mat-1',
    printMethodId: 'pm-1',
    finishingIds: [],
    options: {},
    dimension: { width: 500, height: 500, unit: 'mm' },
  };

  describe('Test 1: Material Filtering', () => {
    it('should filter materials by dimension constraints', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        dimension: { width: 1500, height: 1500, unit: 'mm' },
      };

      const result = filterMaterialsByProduct(mockProduct, selections);

      // Premium Paper has maxWidth/Height 1000mm, should be filtered out
      expect(result.materials).toHaveLength(1);
      expect(result.materials[0].id).toBe('mat-1');
    });

    it('should include all materials when dimensions are within constraints', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        dimension: { width: 500, height: 500, unit: 'mm' },
      };

      const result = filterMaterialsByProduct(mockProduct, selections);

      expect(result.materials).toHaveLength(2);
    });

    it('should calculate effective cost with price modifier', () => {
      const result = filterMaterialsByProduct(mockProduct, baseSelections);

      const premium = result.materials.find((m) => m.id === 'mat-2');
      expect(premium?.effectiveCost).toBe(40); // 30 + 10
    });
  });

  describe('Test 2: Print Method Filtering', () => {
    it('should filter print methods by material compatibility', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        materialId: 'mat-2', // Premium Paper
      };

      const result = filterPrintMethodsByProduct(mockProduct, selections);

      // Offset Print only works with mat-1
      expect(result.printMethods).toHaveLength(1);
      expect(result.printMethods[0].id).toBe('pm-1');
    });

    it('should filter by dimension constraints', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        dimension: { width: 2500, height: 2500, unit: 'mm' },
      };

      const result = filterPrintMethodsByProduct(mockProduct, selections);

      // Digital Print has max 2000x2000mm
      expect(result.printMethods).toHaveLength(1);
      expect(result.printMethods[0].id).toBe('pm-2');
    });
  });

  describe('Test 3: Finishing Filtering', () => {
    it('should filter finishing by material compatibility', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        materialId: 'mat-2',
        finishingIds: ['fin-1', 'fin-2'],
      };

      const result = filterFinishingByProduct(mockProduct, selections);

      // Die Cut only works with mat-1
      expect(result.finishing).toHaveLength(1);
      expect(result.finishing[0].id).toBe('fin-1');
      expect(result.selectedFinishing).toHaveLength(1);
    });
  });

  describe('Test 4: Option Rules', () => {
    it('should apply option rules correctly', () => {
      const productWithRules: ConfiguratorProduct = {
        ...mockProduct,
        options: [
          {
            id: 'opt-size',
            name: 'Size',
            type: 'select',
            required: true,
            values: [
              { value: 'small', label: 'Small' },
              { value: 'large', label: 'Large' },
            ],
          },
          {
            id: 'opt-premium',
            name: 'Premium Features',
            type: 'select',
            required: false,
            values: [
              { value: 'gold', label: 'Gold Foil' },
            ],
            rules: [
              {
                condition: 'option.opt-size = small',
                action: 'hide:opt-premium',
              },
            ],
          },
        ],
      };

      const selectionsSmall: ConfiguratorSelections = {
        ...baseSelections,
        options: { 'opt-size': 'small' },
      };

      const resultSmall = applyOptionRules(productWithRules, selectionsSmall);
      // When size is small, premium should be hidden
      expect(resultSmall.visibleOptions).toHaveLength(1);
      expect(resultSmall.visibleOptions[0].id).toBe('opt-size');

      const selectionsLarge: ConfiguratorSelections = {
        ...baseSelections,
        options: { 'opt-size': 'large' },
      };

      const resultLarge = applyOptionRules(productWithRules, selectionsLarge);
      // When size is large, both should be visible
      expect(resultLarge.visibleOptions).toHaveLength(2);
    });

    it('should add price adjustments from option values', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        options: {
          'opt-1': 'matte', // +5
          'opt-2': ['lamination', 'uv'], // +10 +15
        },
      };

      const result = applyOptionRules(mockProduct, selections);
      expect(result.priceAdjustment).toBe(30); // 5 + 10 + 15
    });
  });

  describe('Test 5: Price Calculation - Fixed', () => {
    it('should calculate base price correctly', () => {
      const result = calculateProductPrice(mockProduct, baseSelections, {});

      expect(result).toBeDefined();
      expect(result?.base).toBe(100);
    });

    it('should apply price breaks', () => {
      const selections10: ConfiguratorSelections = {
        ...baseSelections,
        quantity: 10,
      };

      const result10 = calculateProductPrice(mockProduct, selections10, {});
      expect(result10?.appliedPriceBreak?.pricePerUnit).toBe(90);

      const selections50: ConfiguratorSelections = {
        ...baseSelections,
        quantity: 50,
      };

      const result50 = calculateProductPrice(mockProduct, selections50, {});
      expect(result50?.appliedPriceBreak?.pricePerUnit).toBe(80);
    });
  });

  describe('Test 6: Price Calculation - Per M²', () => {
    it('should calculate area-based pricing', () => {
      const productM2: ConfiguratorProduct = {
        ...mockProduct,
        pricing: {
          type: 'per_sqm',
          basePrice: 50,
        },
      };

      const selections: ConfiguratorSelections = {
        ...baseSelections,
        dimension: { width: 1000, height: 1000, unit: 'mm' }, // 1m²
      };

      const result = calculateProductPrice(productM2, selections, {});
      expect(result?.base).toBe(50); // 50 MDL/m²
    });
  });

  describe('Test 7: Full Integration - Complete Configuration', () => {
    it('should handle complete product configuration', () => {
      const selections: ConfiguratorSelections = {
        quantity: 25,
        materialId: 'mat-1',
        printMethodId: 'pm-1',
        finishingIds: ['fin-1'],
        options: {
          'opt-1': 'matte', // +5
          'opt-2': ['lamination'], // +10
        },
        dimension: { width: 500, height: 500, unit: 'mm' },
      };

      // Step 1: Filter materials
      const materialResult = filterMaterialsByProduct(mockProduct, selections);
      expect(materialResult.selectedMaterial).toBeDefined();
      expect(materialResult.selectedMaterial?.id).toBe('mat-1');

      // Step 2: Filter print methods
      const printResult = filterPrintMethodsByProduct(mockProduct, selections);
      expect(printResult.selectedPrintMethod).toBeDefined();
      expect(printResult.selectedPrintMethod?.id).toBe('pm-1');

      // Step 3: Filter finishing
      const finishingResult = filterFinishingByProduct(mockProduct, selections);
      expect(finishingResult.selectedFinishing).toHaveLength(1);

      // Step 4: Apply option rules
      const optionResult = applyOptionRules(mockProduct, selections);
      expect(optionResult.priceAdjustment).toBe(15); // 5 + 10

      // Step 5: Calculate final price
      const priceResult = calculateProductPrice(mockProduct, selections, {
        material: materialResult.selectedMaterial,
        printMethod: printResult.selectedPrintMethod,
        finishing: finishingResult.selectedFinishing,
        optionPriceAdjustments: optionResult.priceAdjustment,
      });

      expect(priceResult).toBeDefined();
      expect(priceResult?.total).toBeGreaterThan(0);
      expect(priceResult?.quantity).toBe(25);
    });
  });

  describe('Test 8: Edge Cases', () => {
    it('should handle missing dimension', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        dimension: undefined,
      };

      const materialResult = filterMaterialsByProduct(mockProduct, selections);
      expect(materialResult.materials.length).toBeGreaterThan(0);

      const printResult = filterPrintMethodsByProduct(mockProduct, selections);
      expect(printResult.printMethods.length).toBeGreaterThan(0);
    });

    it('should handle zero quantity', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        quantity: 0,
      };

      const result = calculateProductPrice(mockProduct, selections, {});
      expect(result?.quantity).toBe(0);
    });

    it('should validate required options', () => {
      const selections: ConfiguratorSelections = {
        ...baseSelections,
        options: {}, // Missing required opt-1
      };

      const result = applyOptionRules(mockProduct, selections);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Test 9: Custom Formula Pricing', () => {
    it('should evaluate custom pricing formula', () => {
      const productWithFormula: ConfiguratorProduct = {
        ...mockProduct,
        pricing: {
          type: 'custom',
          basePrice: 0,
          formula: 'AREA * 100 + QTY * 10',
        },
      };

      const selections: ConfiguratorSelections = {
        ...baseSelections,
        quantity: 5,
        dimension: { width: 1000, height: 500, unit: 'mm' }, // 0.5 m²
      };

      const result = calculateProductPrice(productWithFormula, selections, {});
      expect(result).toBeDefined();
      // Formula: AREA * 100 + QTY * 10 = 0.5 * 100 + 5 * 10 = 50 + 50 = 100
      // Note: AREA variable in formula evaluation uses actual area
      expect(result?.base).toBe(100);
    });
  });

  describe('Test 10: Production Data', () => {
    it('should include production information', () => {
      expect(mockProduct.production).toBeDefined();
      expect(mockProduct.production?.leadTimeDays).toBe(5);
      expect(mockProduct.production?.stockQuantity).toBe(100);
    });

    it('should respect product dimensions', () => {
      expect(mockProduct.dimensions).toBeDefined();
      expect(mockProduct.dimensions?.widthMin).toBe(100);
      expect(mockProduct.dimensions?.widthMax).toBe(2000);
    });
  });
});
