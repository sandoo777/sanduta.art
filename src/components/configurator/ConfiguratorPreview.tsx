"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import type {
  ConfiguratorProduct,
  ConfiguratorSelections,
} from '@/modules/configurator/types';
import type { ExtendedPriceSummary } from '@/lib/pricing/calculateProductPrice';

interface ConfiguratorPreviewProps {
  product?: ConfiguratorProduct;
  selections: ConfiguratorSelections;
  priceSummary?: ExtendedPriceSummary;
  onAddToCart?: () => void;
  disabled?: boolean;
}

const currency = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'MDL',
  minimumFractionDigits: 2,
});

function formatValue(value: string | string[] | undefined) {
  if (!value) {
    return '—';
  }
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '—';
  }
  return value;
}

export function ConfiguratorPreview({
  product,
  selections,
  priceSummary,
  onAddToCart,
  disabled,
}: ConfiguratorPreviewProps) {
  const imageSrc = product?.defaultImage ?? '/placeholder-product.svg';
  const finishingNames = product?.finishing
    .filter((item) => selections.finishingIds.includes(item.id))
    .map((item) => item.name);

  const optionSummary = product?.options.map((option) => ({
    name: option.name,
    value: formatValue(selections.options?.[option.id]),
  }));

  const priceBreakdown = [
    { label: 'Bază', value: priceSummary ? currency.format(priceSummary.base) : '—' },
    { label: 'Materiale', value: priceSummary ? currency.format(priceSummary.materialCost) : '—' },
    { label: 'Tipărire', value: priceSummary ? currency.format(priceSummary.printCost) : '—' },
    { label: 'Finisaje', value: priceSummary ? currency.format(priceSummary.finishingCost) : '—' },
    { label: 'Opțiuni', value: priceSummary ? currency.format(priceSummary.optionCost) : '—' },
  ];

  const discountRow = priceSummary && priceSummary.discounts > 0
    ? { label: 'Discounturi', value: `- ${currency.format(priceSummary.discounts)}` }
    : null;

  return (
    <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 text-white rounded-t-2xl">
        <CardTitle className="text-2xl font-semibold">Preview Configurator</CardTitle>
        <p className="text-sm text-white/80">
          Verifică selecțiile curente și prețul final înainte de a adăuga produsul în coș.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative h-52 w-full overflow-hidden rounded-xl bg-slate-100 md:w-1/3">
            <Image
              src={imageSrc}
              alt={product?.name ?? 'Produs configurabil'}
              fill
              sizes="(max-width: 768px) 100vw, 30vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <p className="text-sm uppercase tracking-wide">{product?.type ?? 'Produs'}</p>
              <p className="text-lg font-semibold">{product?.name ?? 'Produs configurabil'}</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">{product?.name ?? 'Produs configurabil'}</h4>
            <p className="text-sm text-slate-600">{product?.descriptionShort ?? product?.description ?? 'Completează configuratorul pentru a vedea detaliile produsului.'}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Cantitate</p>
                <p className="text-2xl font-semibold text-slate-900">{selections.quantity}</p>
                {priceSummary?.appliedPriceBreak && (
                  <p className="text-xs text-emerald-600">Price break activ de la {priceSummary.appliedPriceBreak.minQuantity} buc.</p>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {priceSummary ? currency.format(priceSummary.total) : '—'}
                </p>
                <p className="text-xs text-slate-500">TVA inclus</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-5">
            <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sumar cost</h5>
            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              {priceBreakdown.map((row) => (
                <div className="flex items-center justify-between" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
              ))}
              {discountRow && (
                <div className="flex items-center justify-between text-emerald-600">
                  <dt>{discountRow.label}</dt>
                  <dd className="font-semibold">{discountRow.value}</dd>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <dt>Total estimat</dt>
                <dd>{priceSummary ? currency.format(priceSummary.total) : '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5">
            <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Selecții</h5>
            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-start justify-between">
                <dt>Material</dt>
                <dd className="text-right font-medium">{product?.materials.find((mat) => mat.id === selections.materialId)?.name ?? '—'}</dd>
              </div>
              <div className="flex items-start justify-between">
                <dt>Metodă tipărire</dt>
                <dd className="text-right font-medium">{product?.printMethods.find((method) => method.id === selections.printMethodId)?.name ?? '—'}</dd>
              </div>
              <div className="flex items-start justify-between">
                <dt>Finisaje</dt>
                <dd className="text-right font-medium">{finishingNames?.length ? finishingNames.join(', ') : 'Standard'}</dd>
              </div>
              {optionSummary?.map((option) => (
                <div className="flex items-start justify-between" key={option.name}>
                  <dt>{option.name}</dt>
                  <dd className="text-right font-medium">{option.value || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Rezumat final</p>
          <p className="text-xs text-slate-600">
            {priceSummary?.area ? `Suprafață estimată: ${priceSummary.area.toFixed(2)} m² • ` : ''}
            Cantitate {selections.quantity} buc.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={onAddToCart}
          disabled={disabled || !onAddToCart}
          className="shadow-lg"
        >
          Adaugă în coș
        </Button>
      </CardFooter>
    </Card>
  );
}
