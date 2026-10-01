'use client';

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import { DEFAULT_MINIMUM_MARGIN_PERCENT, type MaterialFormData } from '@/lib/validations/admin';

type PricingSectionProps = {
  unit: string;
};

export function PricingSection({ unit }: PricingSectionProps) {
  const form = useFormContext<MaterialFormData>();
  const packagingLabel = useWatch({ control: form.control, name: 'packagingLabel' });
  const purchasePrice = useWatch({ control: form.control, name: 'purchasePrice' });
  const salePrice = useWatch({ control: form.control, name: 'salePrice' });
  const salePriceMode = useWatch({ control: form.control, name: 'salePriceMode' });
  const salePricePercent = useWatch({ control: form.control, name: 'salePricePercent' });
  const minimumMarginPercent = useWatch({ control: form.control, name: 'minimumMarginPercent' });
  const packagingQty = useWatch({ control: form.control, name: 'packagingQty' });
  const packagingPrice = useWatch({ control: form.control, name: 'packagingPrice' });
  const watchedPriceBreaks = useWatch({ control: form.control, name: 'priceBreaks' });
  const { fields: priceBreakFields, append: appendPriceBreak, remove: removePriceBreak } = useFieldArray({
    control: form.control,
    name: 'priceBreaks',
  });

  const toFiniteNumber = (value: unknown): number | null => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const purchasePriceField = form.register('purchasePrice');
  const salePriceField = form.register('salePrice');
  const salePricePercentField = form.register('salePricePercent');

  // Purchase/sale price are "committed" only once editing is finished (blur, Enter, or
  // a form reset from a fresh material load) — never on every keystroke. All pricing
  // calculations (base price, minimum allowed price, price-break rows) derive from these
  // committed values so they don't flicker/reset while the user is still typing.
  const [committedPurchasePrice, setCommittedPurchasePrice] = useState<string>(() => (purchasePrice as string) ?? '');
  const [committedSalePrice, setCommittedSalePrice] = useState<string>(() => (salePrice as string) ?? '');

  const isFormDirty = form.formState.isDirty;

  useEffect(() => {
    if (!isFormDirty) {
      setCommittedPurchasePrice((purchasePrice as string) ?? '');
      setCommittedSalePrice((salePrice as string) ?? '');
    }
  }, [isFormDirty, purchasePrice, salePrice]);

  const computeBasePrice = useCallback((purchaseVal: unknown, saleVal: unknown): number | null => {
    const sale = toFiniteNumber(saleVal);
    const purchase = toFiniteNumber(purchaseVal);

    if (sale !== null && sale >= 0) return sale;
    if (purchase !== null && purchase >= 0) return purchase;

    return null;
  }, []);

  const baseMaterialPrice = useMemo(
    () => computeBasePrice(committedPurchasePrice, committedSalePrice),
    [computeBasePrice, committedPurchasePrice, committedSalePrice],
  );

  const minimumMargin = useMemo(() => {
    const margin = toFiniteNumber(minimumMarginPercent ?? DEFAULT_MINIMUM_MARGIN_PERCENT);
    return margin !== null ? Math.min(Math.max(margin, 0), 100) : DEFAULT_MINIMUM_MARGIN_PERCENT;
  }, [minimumMarginPercent]);

  const minimumAllowedPrice = useMemo(() => {
    const purchase = toFiniteNumber(committedPurchasePrice);
    if (purchase === null) return null;
    return purchase * (1 + minimumMargin / 100);
  }, [minimumMargin, committedPurchasePrice]);

  const baseSellingPrice = useMemo(() => {
    const sale = toFiniteNumber(committedSalePrice);
    const purchase = toFiniteNumber(committedPurchasePrice);

    if (sale !== null && purchase !== null) {
      return Math.max(sale, purchase);
    }

    if (sale !== null) return sale;

    const percent = toFiniteNumber(salePricePercent);
    if (purchase !== null && percent !== null) {
      return purchase * (1 + percent / 100);
    }

    return purchase;
  }, [committedPurchasePrice, committedSalePrice, salePricePercent]);

  const setFieldValueIfChanged = useCallback((fieldName: string, value: string | number, options: { shouldDirty?: boolean; shouldValidate?: boolean } = {}) => {
    const currentValue = form.getValues(fieldName);
    const nextValue = String(value);

    if (String(currentValue ?? '') === nextValue) {
      return;
    }

    form.setValue(fieldName, value, {
      shouldDirty: true,
      shouldValidate: true,
      ...options,
    });
  }, [form]);

  const recalculatePriceBreakRowWithBase = useCallback((index: number, discountValue: unknown, basePrice: number | null) => {
    const parsedDiscount = Number(discountValue ?? 0);
    const discount = Number.isFinite(parsedDiscount) ? parsedDiscount : 0;

    const correctedPrice = basePrice !== null
      ? (basePrice * (1 - discount / 100)).toFixed(2)
      : '';

    setFieldValueIfChanged(`priceBreaks.${index}.price`, correctedPrice, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setFieldValueIfChanged]);

  // Recalculates a single row immediately — used when the user edits that row's own
  // discount value directly (not triggered by purchase/sale price typing).
  const recalculatePriceBreakRow = useCallback((index: number, discountValue: unknown) => {
    recalculatePriceBreakRowWithBase(index, discountValue, baseMaterialPrice);
  }, [baseMaterialPrice, recalculatePriceBreakRowWithBase]);

  const recalculateAllPriceBreakRows = useCallback((basePriceOverride?: number | null) => {
    const rows = form.getValues('priceBreaks') ?? [];
    const basePrice = basePriceOverride !== undefined ? basePriceOverride : baseMaterialPrice;
    rows.forEach((row, index) => {
      recalculatePriceBreakRowWithBase(index, row?.discount, basePrice);
    });
  }, [form, baseMaterialPrice, recalculatePriceBreakRowWithBase]);

  // Commits purchase/sale price as the new settled values and recalculates every
  // price-break row's computed price. Wired to onBlur/Enter of the purchase/sale price
  // inputs — this is the ONLY place tier prices are recalculated from those fields.
  const commitPriceFields = useCallback(() => {
    const nextPurchase = form.getValues('purchasePrice');
    const nextSale = form.getValues('salePrice');
    setCommittedPurchasePrice(nextPurchase ?? '');
    setCommittedSalePrice(nextSale ?? '');
    recalculateAllPriceBreakRows(computeBasePrice(nextPurchase, nextSale));
  }, [form, computeBasePrice, recalculateAllPriceBreakRows]);

  const handlePriceFieldEnterKey = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitPriceFields();
    }
  }, [commitPriceFields]);

  useEffect(() => {
    const qty = parseFloat(packagingQty ?? '');
    const price = parseFloat(packagingPrice ?? '');
    if (!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
      const unitPrice = (price / qty).toFixed(4);
      const currentValue = form.getValues('purchasePrice');
      if (String(currentValue ?? '') !== unitPrice) {
        form.setValue('purchasePrice', unitPrice);
      }
    }
  }, [form, packagingPrice, packagingQty]);

  useEffect(() => {
    if (salePriceMode !== 'percent') return;
    const purchase = parseFloat(purchasePrice ?? '');
    const percent = parseFloat(salePricePercent ?? '');
    if (!isNaN(purchase) && !isNaN(percent) && purchase > 0 && percent >= 0) {
      const computed = (purchase * (1 + percent / 100)).toFixed(2);
      const currentValue = form.getValues('salePrice');
      if (String(currentValue ?? '') !== computed) {
        form.setValue('salePrice', computed);
      }
    }
  }, [salePriceMode, purchasePrice, salePricePercent, form]);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
          Ambalaj Furnizor
          <span className="ml-2 normal-case font-normal text-gray-400">(opțional — calculează automat prețul per unitate)</span>
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <FormLabel>Tip ambalaj</FormLabel>
            <select
              {...form.register('packagingLabel')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Fără ambalaj</option>
              <option value="cutie">Cutie</option>
              <option value="rolă">Rolă</option>
              <option value="palet">Palet</option>
              <option value="sac">Sac</option>
              <option value="bidon">Bidon</option>
              <option value="set">Set</option>
            </select>
          </div>

          <div>
            <FormLabel>
              Cantitate per {packagingLabel || 'ambalaj'} ({unit || 'unități'})
            </FormLabel>
            <Input
              {...form.register('packagingQty')}
              type="number"
              step="0.01"
              min="0"
              placeholder={unit === 'sheet' ? '500' : unit === 'm2' ? '75' : unit === 'meter' ? '50' : '1'}
            />
          </div>

          <div>
            <FormLabel>Preț per {packagingLabel || 'ambalaj'} (MDL)</FormLabel>
            <Input
              {...form.register('packagingPrice')}
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
            />
          </div>
        </div>

        {packagingQty && packagingPrice && parseFloat(packagingQty) > 0 && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
            <span className="font-medium text-blue-800">Calcul automat: </span>
            <span className="text-blue-700">
              {packagingPrice} MDL ÷ {packagingQty} {unit} = <strong>{(parseFloat(packagingPrice) / parseFloat(packagingQty)).toFixed(4)} MDL/{unit}</strong>
            </span>
            <span className="ml-2 text-xs text-blue-500">→ Preț achiziție per unitate setat automat</span>
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Prețuri</p>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Cost achiziție</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {purchasePrice && Number(purchasePrice) > 0 ? `${Number(purchasePrice).toFixed(2)} MDL` : '—'}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Preț de bază</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {baseSellingPrice !== null ? `${Number(baseSellingPrice).toFixed(2)} MDL` : '—'}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs uppercase tracking-wide text-amber-700">Minimum allowed price</p>
            <p className="mt-1 text-lg font-semibold text-amber-900">
              {minimumAllowedPrice !== null ? `${minimumAllowedPrice.toFixed(2)}` : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="purchasePrice">Preț achiziție (MDL / {unit || 'unitate'})</FormLabel>
            <div className="relative">
              <Input
                id="purchasePrice"
                {...purchasePriceField}
                onBlur={(event) => { purchasePriceField.onBlur(event); commitPriceFields(); }}
                onKeyDown={handlePriceFieldEnterKey}
                type="number"
                step="0.01"
                readOnly={!!(packagingQty && packagingPrice)}
                className={packagingQty && packagingPrice ? 'cursor-default bg-gray-50 pr-14 text-gray-600' : ''}
              />
              {packagingQty && packagingPrice && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-blue-500">auto</span>
              )}
            </div>
            {packagingQty && packagingPrice && (
              <p className="mt-1 text-xs text-blue-600">= {packagingPrice} ÷ {packagingQty} {unit} (din ambalaj)</p>
            )}
            {form.formState.errors.purchasePrice && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.purchasePrice.message}</p>
            )}
          </div>

          <div>
            <FormLabel>Mod preț vânzare</FormLabel>
            <select
              {...form.register('salePriceMode')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="amount">Sumă fixă</option>
              <option value="percent">Adaos % față de achiziție</option>
            </select>
          </div>

          <div>
            <Input
              label="Minimum Margin (%)"
              {...form.register('minimumMarginPercent')}
              type="text"
              inputMode="numeric"
            />
            {form.formState.errors.minimumMarginPercent && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.minimumMarginPercent.message}</p>
            )}
          </div>

          {salePriceMode === 'percent' ? (
            <>
              <div>
                <FormLabel htmlFor="salePricePercent">Adaos (%)</FormLabel>
                <Input
                  id="salePricePercent"
                  {...salePricePercentField}
                  onBlur={(event) => { salePricePercentField.onBlur(event); commitPriceFields(); }}
                  onKeyDown={handlePriceFieldEnterKey}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="20"
                />
                {form.formState.errors.salePricePercent && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.salePricePercent.message}</p>
                )}
              </div>
              <div>
                <FormLabel htmlFor="salePrice">Preț vânzare calculat (MDL)</FormLabel>
                <Input
                  id="salePrice"
                  {...form.register('salePrice')}
                  type="number"
                  step="0.01"
                  readOnly
                  className="cursor-default bg-gray-50 text-gray-600"
                />
                {purchasePrice && salePricePercent && (
                  <p className="mt-1 text-xs text-blue-600">= {purchasePrice} × (1 + {salePricePercent}%) — calculat automat</p>
                )}
              </div>
            </>
          ) : (
            <div>
              <FormLabel htmlFor="salePrice">Preț vânzare (MDL / {unit || 'unitate'})</FormLabel>
              <Input
                id="salePrice"
                {...salePriceField}
                onBlur={(event) => { salePriceField.onBlur(event); commitPriceFields(); }}
                onKeyDown={handlePriceFieldEnterKey}
                type="number"
                step="0.01"
              />
              {form.formState.errors.salePrice && (
                <p className="mt-1 text-sm text-red-500">{form.formState.errors.salePrice.message}</p>
              )}
            </div>
          )}
        </div>

        {baseMaterialPrice !== null && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Preț final de bază: <strong>{baseMaterialPrice.toFixed(2)} MDL / {unit || 'unitate'}</strong>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Gradație prețuri / reduceri</p>
          <button
            type="button"
            onClick={() => appendPriceBreak({
              qtyMin: '',
              qtyMax: '',
              discount: '',
              price: baseMaterialPrice !== null ? baseMaterialPrice.toFixed(2) : '',
            })}
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs hover:bg-gray-50"
          >
            + Adaugă rând
          </button>
        </div>

        {priceBreakFields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500">
            Fără gradații configurate.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Cantitate minimă</th>
                  <th className="px-3 py-2 text-left font-medium">Cantitate maximă</th>
                  <th className="px-3 py-2 text-left font-medium">Reducere (%)</th>
                  <th className="px-3 py-2 text-left font-medium">Preț calculat</th>
                  <th className="px-3 py-2 text-right font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {priceBreakFields.map((field, index) => {
                  const discountField = form.register(`priceBreaks.${index}.discount`);
                  const rowError = form.formState.errors.priceBreaks?.[index]?.price?.message;
                  const discountError = form.formState.errors.priceBreaks?.[index]?.discount?.message;
                  const rowPrice = watchedPriceBreaks?.[index]?.price;
                  const rowInvalid = minimumAllowedPrice !== null && typeof rowPrice === 'string' && Number(rowPrice) < minimumAllowedPrice;
                  const rowPriceValue = toFiniteNumber(rowPrice);
                  const rowPurchaseValue = toFiniteNumber(committedPurchasePrice);
                  const rowMargin = rowPriceValue !== null && rowPurchaseValue !== null && rowPurchaseValue > 0
                    ? ((rowPriceValue - rowPurchaseValue) / rowPurchaseValue) * 100
                    : null;

                  return (
                    <tr key={field.id} className={`border-t border-gray-200 ${rowError || rowInvalid ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2">
                        <Input {...form.register(`priceBreaks.${index}.qtyMin`)} type="number" min="0" step="1" />
                      </td>
                      <td className="px-3 py-2">
                        <Input {...form.register(`priceBreaks.${index}.qtyMax`)} type="number" min="0" step="1" />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          {...discountField}
                          onChange={(event) => {
                            discountField.onChange(event);
                            recalculatePriceBreakRow(index, event.target.value);
                          }}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className={rowInvalid || discountError ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}
                        />
                        {discountError && (
                          <p className="mt-1 text-xs text-red-600">{discountError}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          {...form.register(`priceBreaks.${index}.price`)}
                          type="number"
                          min="0"
                          step="0.01"
                          readOnly
                          className={rowInvalid || rowError ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500' : ''}
                        />
                        {rowMargin !== null && (
                          <p className={`mt-1 text-xs ${rowMargin < minimumMargin ? 'text-red-600' : 'text-emerald-700'}`}>
                            Margin: {rowMargin.toFixed(2)}%
                          </p>
                        )}
                        {rowInvalid && (
                          <p className="mt-1 text-xs text-red-600">Reducerea depășește marja minimă permisă.</p>
                        )}
                        {rowError && (
                          <p className="mt-1 text-xs text-red-600">{rowError}</p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removePriceBreak(index)}
                          className="rounded-md border border-rose-300 px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
