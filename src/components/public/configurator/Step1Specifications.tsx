'use client';

import { useMemo, type ReactElement, type ReactNode } from 'react';
import type { PriceSelection } from '@/modules/configurator/usePriceCalculator';

export interface Step1Props {
  selection: PriceSelection;
  onChange: (next: PriceSelection) => void;
}

const dimensionOptions: { value: PriceSelection['dimension']; label: string; desc: string }[] = [
  { value: 'A6', label: 'A6', desc: '148 x 105 mm' },
  { value: 'A5', label: 'A5', desc: '210 x 148 mm' },
  { value: 'A4', label: 'A4', desc: '297 x 210 mm' },
  { value: 'custom', label: 'Custom', desc: 'Dimensiune personalizată' },
];

const materialOptions: { value: PriceSelection['material']; label: string; desc: string }[] = [
  { value: '130g', label: 'Hârtie 130g', desc: 'Economică, ideală pentru volume mari' },
  { value: '170g', label: 'Hârtie 170g', desc: 'Echilibru optim între cost și calitate' },
  { value: '300g', label: 'Carton 300g', desc: 'Premium, rigid, senzație profesională' },
];

const finishOptions: { value: PriceSelection['finishes'][number]; label: string; desc: string }[] = [
  { value: 'laminare-lucioasa', label: 'Laminare lucioasă', desc: 'Culori vii, protecție superioară' },
  { value: 'laminare-mata', label: 'Laminare mată', desc: 'Aspect elegant, anti-amprentă' },
  { value: 'colturi-rotunjite', label: 'Colțuri rotunjite', desc: 'Siguranță și estetica cardurilor' },
  { value: 'perforare', label: 'Perforare', desc: 'Detasare ușoară, cupon / bilet' },
  { value: 'pliere', label: 'Pliere', desc: 'Pliante, broșuri, meniuri' },
];

const quantityPresets = [100, 250, 500, 1000, 2500];

const productionOptions: { value: PriceSelection['productionSpeed']; label: string; desc: string }[] = [
  { value: 'standard', label: 'Standard', desc: '2-3 zile' },
  { value: 'express', label: 'Express', desc: '24h' },
  { value: 'super-express', label: 'Super Express', desc: '6h' },
];

export function Step1Specifications({ selection, onChange }: Step1Props) {
  const toggleFinish = (finish: PriceSelection['finishes'][number]) => {
    const exists = selection.finishes.includes(finish);
    const finishes = exists
      ? selection.finishes.filter((f) => f !== finish)
      : [...selection.finishes, finish];
    onChange({ ...selection, finishes });
  };

  const handleQuantity = (value: number) => {
    const qty = Number.isFinite(value) ? Math.max(1, Math.round(value)) : 1;
    onChange({ ...selection, quantity: qty });
  };

  const activeClasses = useMemo(
    () =>
      'ring-2 ring-blue-600 bg-blue-50 border-blue-200 shadow-sm shadow-blue-200 text-blue-900',
    []
  );

  return (
    <div className="space-y-8">
      {/* Dimensiune */}
      <Section
        icon={SizeIcon}
        title="Alege dimensiunea"
        subtitle="Selectează formatul potrivit pentru produsul tău."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dimensionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange({ ...selection, dimension: option.value })}
              className={classNames(
                'w-full text-left border rounded-lg p-4 bg-white hover:shadow-md transition shadow-sm',
                selection.dimension === option.value ? activeClasses : 'border-gray-200'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">{option.label}</span>
                {selection.dimension === option.value && <CheckIcon />}
              </div>
              <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Material */}
      <Section
        icon={MaterialIcon}
        title="Selectează materialul"
        subtitle="Alege hârtia sau cartonul în funcție de calitatea dorită."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {materialOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange({ ...selection, material: option.value })}
              className={classNames(
                'w-full text-left border rounded-lg p-4 bg-white hover:shadow-md transition shadow-sm',
                selection.material === option.value ? activeClasses : 'border-gray-200'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                </div>
                {selection.material === option.value && <CheckIcon />}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Finisaje */}
      <Section
        icon={FinishIcon}
        title="Finisaje opționale"
        subtitle="Adaugă finisaje pentru un aspect premium."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {finishOptions.map((finish) => {
            const isActive = selection.finishes.includes(finish.value);
            return (
              <button
                key={finish.value}
                onClick={() => toggleFinish(finish.value)}
                className={classNames(
                  'w-full text-left border rounded-lg p-4 bg-white hover:shadow-md transition shadow-sm',
                  isActive ? activeClasses : 'border-gray-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{finish.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{finish.desc}</p>
                  </div>
                  {isActive && <CheckIcon />}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Cantitate */}
      <Section
        icon={QuantityIcon}
        title="Cantitate"
        subtitle="Alege o cantitate predefinită sau introdu una custom."
      >
        <div className="flex flex-wrap gap-3">
          {quantityPresets.map((qty) => (
            <button
              key={qty}
              onClick={() => handleQuantity(qty)}
              className={classNames(
                'px-4 py-2 border rounded-lg bg-white hover:shadow-md transition shadow-sm',
                selection.quantity === qty ? activeClasses : 'border-gray-200'
              )}
            >
              {qty}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={selection.quantity}
              onChange={(e) => handleQuantity(Number(e.target.value))}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Cantitate custom"
            />
            <span className="text-sm text-gray-500">buc</span>
          </div>
        </div>
      </Section>

      {/* Timp de producție */}
      <Section
        icon={ClockIcon}
        title="Timp de producție"
        subtitle="Alege viteza de producție care se potrivește timeline-ului tău."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {productionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange({ ...selection, productionSpeed: option.value })}
              className={classNames(
                'w-full text-left border rounded-lg p-4 bg-white hover:shadow-md transition shadow-sm',
                selection.productionSpeed === option.value ? activeClasses : 'border-gray-200'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                </div>
                {selection.productionSpeed === option.value && <CheckIcon />}
              </div>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

interface SectionProps {
  icon: () => ReactElement;
  title: string;
  subtitle: string;
  children: ReactNode;
}

function Section({ icon: Icon, title, subtitle, children }: SectionProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <Icon />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SizeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l6-4 6 4 6-4v14l-6 4-6-4-6 4z" />
    </svg>
  );
}

function MaterialIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h6l6 6v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
    </svg>
  );
}

function FinishIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-9 6h10a2 2 0 002-2V9a2 2 0 00-.586-1.414l-5-5A2 2 0 0010.172 2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function QuantityIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M7 6h10m-9 12h8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
