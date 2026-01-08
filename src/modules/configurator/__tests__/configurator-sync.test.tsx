import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mapProductToConfigurator } from '@/lib/products/mapProductToConfigurator';
import { filterMaterialsByProduct } from '@/lib/configurator/filterMaterialsByProduct';
import { filterPrintMethodsByProduct } from '@/lib/configurator/filterPrintMethodsByProduct';
import { filterFinishingByProduct } from '@/lib/configurator/filterFinishingByProduct';
import { calculateProductPrice } from '@/lib/pricing/calculateProductPrice';
import { applyOptionRules } from '@/lib/configurator/applyOptionRules';
import { ConfiguratorPreview } from '@/components/configurator/ConfiguratorPreview';
import type { ConfiguratorProduct, ConfiguratorSelections } from '@/modules/configurator/types';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

const basePrismaProduct = {
  id: 'prod-standard',
  name: 'Poster Standard',
  slug: 'poster-standard',
  sku: null,
  description: 'Poster de test',
  descriptionShort: 'Poster premium',
  type: 'STANDARD',
  price: 120,
  categoryId: 'cat-1',
  active: true,
  metaTitle: null,
  metaDescription: null,
  ogImage: null,
  options: [
    {
      id: 'color',
      name: 'Culoare',
      type: 'dropdown',
      required: true,
      values: [
        { label: 'Alb', value: 'alb', priceModifier: 0 },
        { label: 'Negru', value: 'negru', priceModifier: 10 },
      ],
      rules: [
        {
          condition: 'option.color = negru',
          action: 'price:15',
        },
      ],
    },
  ],
  pricing: {
    type: 'per_unit',
    basePrice: 120,
    priceBreaks: [{ minQuantity: 100, maxQuantity: null, pricePerUnit: 90 }],
  },
  production: {
    operations: [{ name: 'Print', order: 1, timeMinutes: 20 }],
    estimatedTime: 20,
  },
  dimensions: {
    widthMin: 10,
    widthMax: 200,
    heightMin: 10,
    heightMax: 300,
    unit: 'cm',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/poster.png',
      productId: 'prod-standard',
      createdAt: new Date(),
    },
  ],
  materials: [
    {
      id: 'rel-mat',
      productId: 'prod-standard',
      materialId: 'mat-1',
      priceModifier: 5,
      createdAt: new Date(),
      material: {
        id: 'mat-1',
        name: 'PVC premium',
        sku: 'PVC-01',
        unit: 'm2',
        stock: 100,
        minStock: 5,
        costPerUnit: 30,
        notes: JSON.stringify({ maxWidth: 250, unit: 'cm' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
  printMethods: [
    {
      id: 'rel-pm',
      productId: 'prod-standard',
      printMethodId: 'pm-1',
      createdAt: new Date(),
      printMethod: {
        id: 'pm-1',
        name: 'Digital UV',
        type: 'Digital',
        costPerM2: 18,
        costPerSheet: null,
        speed: null,
        maxWidth: 2500,
        maxHeight: 1500,
        description: null,
        active: true,
        materialIds: ['mat-1'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
  finishing: [
    {
      id: 'rel-fin',
      productId: 'prod-standard',
      finishingId: 'fin-1',
      priceModifier: 3,
      createdAt: new Date(),
      finishing: {
        id: 'fin-1',
        name: 'Laminare lucioasă',
        type: 'Laminare',
        costFix: 15,
        costPerUnit: 1,
        costPerM2: 5,
        timeSeconds: 60,
        compatibleMaterialIds: ['mat-1'],
        compatiblePrintMethodIds: ['pm-1'],
        description: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
} as const;

function buildConfiguratorProduct(overrides: Partial<ConfiguratorProduct> = {}): ConfiguratorProduct {
  const mapped = mapProductToConfigurator(basePrismaProduct as any);
  return {
    ...mapped,
    ...overrides,
  };
}

describe('Configurator sync pipeline', () => {
  let product: ConfiguratorProduct;
  let selections: ConfiguratorSelections;

  beforeEach(() => {
    product = buildConfiguratorProduct();
    selections = {
      quantity: 10,
      materialId: product.materials[0]?.id,
      printMethodId: product.printMethods[0]?.id,
      finishingIds: product.finishing.slice(0, 1).map((item) => item.id),
      options: { color: 'alb' },
      dimension: { width: 50, height: 70, unit: 'cm' },
    };
  });

  it('Produs standard → mapare completă pentru configurator', () => {
    const mapped = mapProductToConfigurator(basePrismaProduct as any);
    expect(mapped.name).toBe('Poster Standard');
    expect(mapped.options).toHaveLength(1);
    expect(mapped.materials[0]?.name).toBe('PVC premium');
    expect(mapped.defaults.optionValues).toHaveProperty('color');
  });

  it('Produs configurabil → dimensiunile limitează materialele disponibile', () => {
    const constrainedSelections = { ...selections, dimension: { width: 400, height: 300, unit: 'cm' } };
    const result = filterMaterialsByProduct(product, constrainedSelections);
    expect(result.materials).toHaveLength(0);
    expect(result.issues[0]).toMatch(/nu este compatibil/);
  });

  it('Price breaks → totalul scade corespunzător cantității', () => {
    const highQuantity = { ...selections, quantity: 150 };
    const summary = calculateProductPrice(product, highQuantity);
    expect(summary.appliedPriceBreak?.minQuantity).toBe(100);
    expect(summary.base).toBeLessThan(120 * 150);
  });

  it('Formulă custom → calculează corect în funcție de variabile', () => {
    const formulaProduct = buildConfiguratorProduct({
      pricing: {
        ...product.pricing,
        type: 'formula',
        formula: 'BASE * QTY + MATERIAL_COST + PRINT_COST + OPTION_COST',
      },
    });
    const summary = calculateProductPrice(formulaProduct, selections);
    const expectedBase =
      formulaProduct.pricing.basePrice * selections.quantity +
      summary.materialCost +
      summary.printCost +
      summary.optionCost;
    expect(summary.base).toBeCloseTo(expectedBase, 2);
  });

  it('Finisaje → adaugă cost suplimentar în total', () => {
    const withoutFinishing = calculateProductPrice(product, { ...selections, finishingIds: [] });
    const withFinishing = calculateProductPrice(product, selections, {
      finishing: product.finishing,
    });
    expect(withFinishing.finishingCost).toBeGreaterThan(withoutFinishing.finishingCost);
  });

  it('Metode tipărire → filtrează după material și dimensiuni', () => {
    const filtered = filterPrintMethodsByProduct(product, { ...selections, materialId: 'alt-material' });
    expect(filtered.printMethods).toHaveLength(0);
  });

  it('Opțiuni custom → regulile aplică ascundere și preț suplimentar', () => {
    const rules = applyOptionRules(product, { ...selections, options: { color: 'negru' } });
    expect(rules.priceAdjustment).toBeGreaterThan(0);
    expect(rules.visibleOptions[0]?.values.find((value) => value.value === 'negru')).toBeDefined();
  });

  it('Preview → afișează selecțiile și prețul final', () => {
    const summary = calculateProductPrice(product, selections);
    render(
      <ConfiguratorPreview
        product={product}
        selections={selections}
        priceSummary={summary}
        onAddToCart={() => {}}
      />
    );

    expect(screen.getAllByText('Poster Standard').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Total/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Adaugă în coș/i })).toBeEnabled();
  });
});
