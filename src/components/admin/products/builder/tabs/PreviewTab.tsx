'use client';

import { useMemo, useState } from 'react';
import type { CreateFullProductInput, ProductOption } from '@/modules/products/productBuilder.types';
import { PRODUCT_TYPES } from '@/modules/products/types';

interface PreviewTabProps {
  data: CreateFullProductInput;
  calculatePreviewPrice: (pricing: CreateFullProductInput['pricing'], quantity?: number, area?: number) => number;
}

export function PreviewTab({ data, calculatePreviewPrice }: PreviewTabProps) {
  const [quantity, setQuantity] = useState(25);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');

  const typeInfo = PRODUCT_TYPES.find((type) => type.value === data.type);

  const previewArea = useMemo(() => {
    if (!width || !height) {
      return undefined;
    }
    const widthMeters = Number(width) / 1000;
    const heightMeters = Number(height) / 1000;
    return Number((widthMeters * heightMeters).toFixed(3));
  }, [width, height]);

  const previewPrice = useMemo(() => {
    return calculatePreviewPrice(data.pricing, quantity, previewArea);
  }, [data.pricing, quantity, previewArea, calculatePreviewPrice]);

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Tip produs" value={typeInfo?.label ?? data.type} description={typeInfo?.color === 'purple' ? 'Configurare avansată' : 'Setare standard'} />
        <SummaryCard
          title="Status"
          value={data.active ? 'Activ' : 'Inactiv'}
          description={data.active ? 'Disponibil imediat după publicare' : 'Ascuns până la activare'}
          accent={data.active ? 'text-green-600' : 'text-gray-500'}
        />
        <SummaryCard
          title="Metodă pricing"
          value={formatPricingType(data.pricing.type)}
          description={data.pricing.priceBreaks.length > 0 ? `${data.pricing.priceBreaks.length} intervale volum` : 'Fără intervale definite'}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompatibilityCard
          title="Materiale"
          count={data.compatibleMaterials?.length ?? 0}
          emptyText="Nu ai selectat materiale compatibile încă."
        />
        <CompatibilityCard
          title="Metode print"
          count={data.compatiblePrintMethods?.length ?? 0}
          emptyText="Adaugă cel puțin o metodă pentru configurator."
        />
        <CompatibilityCard
          title="Finisări"
          count={data.compatibleFinishing?.length ?? 0}
          emptyText="Definește operațiunile disponibile pentru client."
        />
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Opțiuni configurator</h3>
          <p className="text-sm text-gray-600">Cum va arăta experiența de configurare pentru client</p>
        </div>
        {(!data.options || data.options.length === 0) && (
          <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
            Acest produs nu are încă opțiuni configurabile. Adaugă câmpuri în tab-ul &quot;Opțiuni&quot;.
          </p>
        )}
        {data.options && data.options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.options.map((option) => (
              <div key={option.name} className="border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900">{option.name}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{renderOptionType(option.type)}</p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  {option.values.map((value) => (
                    <li key={value.value}>
                      {value.label}
                      {value.priceModifier && value.priceModifier !== 0 && (
                        <span className="text-gray-500"> ({value.priceModifier > 0 ? '+' : ''}{value.priceModifier} MDL)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Simulator final</h3>
          <p className="text-sm text-gray-600">Asigură-te că prețul afișat clientului este corect</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Cantitate</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Lățime (mm)</label>
            <input
              type="number"
              min="0"
              value={width}
              onChange={(event) => setWidth(event.target.value === '' ? '' : Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Înălțime (mm)</label>
            <input
              type="number"
              min="0"
              value={height}
              onChange={(event) => setHeight(event.target.value === '' ? '' : Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wide text-blue-100">Preț estimat</p>
            <p className="text-3xl font-bold">{previewPrice.toFixed(2)} MDL</p>
            {previewArea && <p className="text-xs text-blue-100">Arie: {previewArea} m²</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description?: string;
  accent?: string;
}

function SummaryCard({ title, value, description, accent }: SummaryCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
      <p className={`text-2xl font-semibold text-gray-900 mt-1 ${accent ?? ''}`}>{value}</p>
      {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
    </div>
  );
}

interface CompatibilityCardProps {
  title: string;
  count: number;
  emptyText: string;
}

function CompatibilityCard({ title, count, emptyText }: CompatibilityCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
      <p className="text-sm text-gray-600 mt-1">{count === 0 ? emptyText : 'Selectate pentru configurator'}</p>
    </div>
  );
}

function formatPricingType(type: CreateFullProductInput['pricing']['type']) {
  switch (type) {
    case 'per_unit':
      return 'Per unitate';
    case 'per_sqm':
      return 'Per m²';
    case 'per_weight':
      return 'Per greutate';
    case 'formula':
      return 'Formulă custom';
    default:
      return 'Preț fix';
  }
}

function renderOptionType(type: ProductOption['type']) {
  switch (type) {
    case 'radio':
      return 'Selectare unică';
    case 'checkbox':
      return 'Selectare multiplă';
    case 'numeric':
      return 'Valoare numerică';
    case 'color':
      return 'Paletă culori';
    default:
      return 'Dropdown';
  }
}
