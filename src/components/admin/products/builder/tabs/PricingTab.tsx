'use client';

import { useMemo, useState } from 'react';
import type { ProductPricing } from '@/modules/products/productBuilder.types';

interface PricingTabProps {
  pricing: ProductPricing;
  onChange: (pricing: ProductPricing) => void;
  calculatePreviewPrice: (pricing: ProductPricing, quantity?: number, area?: number) => number;
}

type PricingField = keyof ProductPricing;
type BreakField = 'minQuantity' | 'maxQuantity' | 'pricePerUnit';
type DiscountField = 'type' | 'value' | 'minQuantity';

export function PricingTab({ pricing, onChange, calculatePreviewPrice }: PricingTabProps) {
  const [previewQuantity, setPreviewQuantity] = useState(100);
  const [previewWidth, setPreviewWidth] = useState<number | ''>('');
  const [previewHeight, setPreviewHeight] = useState<number | ''>('');

  const priceBreaks = pricing.priceBreaks || [];
  const discounts = pricing.discounts || [];

  const handlePricingField = (field: PricingField, value: unknown) => {
    onChange({ ...pricing, [field]: value });
  };

  const handleBreakChange = (index: number, field: BreakField, value: string) => {
    const next = [...priceBreaks];
    const parsedValue = value === '' ? null : Number(value);
    next[index] = {
      ...next[index],
      [field]: field === 'maxQuantity' ? parsedValue : Number(value),
    };
    onChange({ ...pricing, priceBreaks: next });
  };

  const handleDiscountChange = (index: number, field: DiscountField, value: string) => {
    const next = [...discounts];
    if (field === 'type') {
      next[index] = { ...next[index], type: value as 'percentage' | 'fixed' };
    } else {
      next[index] = { ...next[index], [field]: value === '' ? undefined : Number(value) };
    }
    onChange({ ...pricing, discounts: next });
  };

  const addPriceBreak = () => {
    const next = [
      ...priceBreaks,
      {
        minQuantity: priceBreaks.length > 0 ? priceBreaks[priceBreaks.length - 1].minQuantity + 1 : 1,
        maxQuantity: null,
        pricePerUnit: pricing.basePrice || 0,
      },
    ];
    onChange({ ...pricing, priceBreaks: next });
  };

  const removePriceBreak = (index: number) => {
    const next = priceBreaks.filter((_, idx) => idx !== index);
    onChange({ ...pricing, priceBreaks: next });
  };

  const addDiscount = () => {
    const next = [
      ...discounts,
      {
        type: 'percentage' as const,
        value: 5,
        minQuantity: 0,
      },
    ];
    onChange({ ...pricing, discounts: next });
  };

  const removeDiscount = (index: number) => {
    const next = discounts.filter((_, idx) => idx !== index);
    onChange({ ...pricing, discounts: next });
  };

  const previewArea = useMemo(() => {
    if (!previewWidth || !previewHeight) {
      return undefined;
    }
    const widthInMeters = Number(previewWidth) / 1000;
    const heightInMeters = Number(previewHeight) / 1000;
    return Number((widthInMeters * heightInMeters).toFixed(4));
  }, [previewWidth, previewHeight]);

  const previewPrice = useMemo(() => {
    return calculatePreviewPrice(pricing, previewQuantity, previewArea);
  }, [pricing, previewQuantity, previewArea, calculatePreviewPrice]);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Metoda de pricing</h3>
          <p className="text-sm text-gray-600">Alege modul în care se calculează prețul final</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tip pricing</label>
            <select
              value={pricing.type}
              onChange={(event) => handlePricingField('type', event.target.value as ProductPricing['type'])}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="fixed">Preț fix</option>
              <option value="per_unit">Per unitate</option>
              <option value="per_sqm">Per m²</option>
              <option value="per_weight">Per greutate</option>
              <option value="formula">Formulă personalizată</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Preț de bază</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pricing.basePrice}
              onChange={(event) => handlePricingField('basePrice', Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          {pricing.type === 'per_weight' && (
            <div className="md:col-span-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
              Prețul final va fi calculat în funcție de greutatea specificată de operator în comanda finală.
            </div>
          )}
          {pricing.type === 'per_unit' && (
            <div className="md:col-span-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-4">
              Preț final = Preț de bază × Cantitatea selectată
            </div>
          )}
          {pricing.type === 'per_sqm' && (
            <div className="md:col-span-2 text-sm text-gray-600 bg-purple-50 border border-purple-100 rounded-lg p-4">
              Preț final = Preț de bază × Aria (m²) × Cantitate
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Price breaks</h3>
            <p className="text-sm text-gray-600">Stabilește discount-uri automate pe cantitate</p>
          </div>
          <button
            type="button"
            onClick={addPriceBreak}
            className="text-sm font-semibold text-blue-600"
          >
            + Adaugă interval
          </button>
        </div>
        {priceBreaks.length === 0 && (
          <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
            Nu există intervale definite. Prețul va fi același indiferent de cantitate.
          </p>
        )}
        {priceBreaks.length > 0 && (
          <div className="space-y-3">
            {priceBreaks.map((priceBreak, index) => (
              <div key={`break-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Cantitate minimă</label>
                  <input
                    type="number"
                    min="1"
                    value={priceBreak.minQuantity}
                    onChange={(event) => handleBreakChange(index, 'minQuantity', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Cantitate maximă</label>
                  <input
                    type="number"
                    min="1"
                    value={priceBreak.maxQuantity ?? ''}
                    onChange={(event) => handleBreakChange(index, 'maxQuantity', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="∞"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Preț per unitate</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceBreak.pricePerUnit}
                    onChange={(event) => handleBreakChange(index, 'pricePerUnit', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removePriceBreak(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Elimină
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Discount-uri</h3>
            <p className="text-sm text-gray-600">Aplica automat discount-uri suplimentare</p>
          </div>
          <button type="button" onClick={addDiscount} className="text-sm font-semibold text-blue-600">
            + Adaugă discount
          </button>
        </div>
        {discounts.length === 0 && (
          <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
            Niciun discount configurat. Poți adăuga discount-uri procentuale sau fixe.
          </p>
        )}
        {discounts.length > 0 && (
          <div className="space-y-3">
            {discounts.map((discount, index) => (
              <div key={`discount-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Tip discount</label>
                  <select
                    value={discount.type}
                    onChange={(event) => handleDiscountChange(index, 'type', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Procent</option>
                    <option value="fixed">Suma fixă</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Valoare</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount.value}
                    onChange={(event) => handleDiscountChange(index, 'value', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Cantitate minimă</label>
                  <input
                    type="number"
                    min="0"
                    value={discount.minQuantity ?? ''}
                    onChange={(event) => handleDiscountChange(index, 'minQuantity', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removeDiscount(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Elimină
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {pricing.type === 'formula' && (
        <section className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Formula personalizată</h3>
            <p className="text-sm text-gray-600">
              Folosește variabile precum <code>width</code>, <code>height</code>, <code>area</code>, <code>quantity</code>, <code>materialCost</code>,
              <code>printCost</code>, <code>finishingCost</code>.
            </p>
          </div>
          <textarea
            rows={4}
            value={pricing.formula ?? ''}
            onChange={(event) => handlePricingField('formula', event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="(area * materialCost) + printCost + finishingCost"
          />
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Simulator rapid</h3>
          <p className="text-sm text-gray-600">Testează configurația de pricing înainte de publicare</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Cantitate</label>
            <input
              type="number"
              min="1"
              value={previewQuantity}
              onChange={(event) => setPreviewQuantity(Math.max(1, Number(event.target.value)))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Lățime (mm)</label>
            <input
              type="number"
              min="0"
              value={previewWidth}
              onChange={(event) => setPreviewWidth(event.target.value === '' ? '' : Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Înălțime (mm)</label>
            <input
              type="number"
              min="0"
              value={previewHeight}
              onChange={(event) => setPreviewHeight(event.target.value === '' ? '' : Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-blue-600 text-white rounded-xl p-4 flex flex-col justify-center">
            <p className="text-sm uppercase tracking-wide text-blue-100">Preț estimat</p>
            <p className="text-2xl font-bold">{previewPrice.toFixed(2)} MDL</p>
            {previewArea && (
              <p className="text-xs text-blue-100">Arie estimată: {previewArea} m²</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
