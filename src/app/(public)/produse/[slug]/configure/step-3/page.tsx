'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Step3Upsell } from '@/components/public/configurator/Step3Upsell';
import { PriceSidebar, type SidebarUpsell } from '@/components/public/configurator/PriceSidebar';
import { usePriceCalculator, type PriceSelection } from '@/modules/configurator/usePriceCalculator';

export default function ConfigureUpsellPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const calculator = usePriceCalculator();

  const productName = useMemo(() => {
    const raw = params?.slug || 'produs';
    return raw
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, [params?.slug]);

  const [selection, setSelection] = useState<PriceSelection>({
    dimension: 'A5',
    material: '170g',
    finishes: [],
    quantity: 500,
    productionSpeed: 'standard',
  });

  const [upsells, setUpsells] = useState<SidebarUpsell[]>([]);

  const mobileTotal = useMemo(() => calculator.calcTotal(selection).total, [selection, calculator]);

  const handleContinue = () => {
    router.push(`/produse/${params?.slug}/configure/step-4`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600">Acasă</Link>
          <span>/</span>
          <Link href="/produse" className="hover:text-blue-600">Produse</Link>
          <span>/</span>
          <Link href={`/produse/${params?.slug}`} className="hover:text-blue-600">{productName}</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Upsell inteligent</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">Pasul 3</span>
            <p className="text-sm text-gray-600">Recomandări personalizate pentru valoare maximă</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Upsell inteligent pentru {productName}</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Alege cantități mai avantajoase, finisaje premium sau produse complementare pentru un rezultat mai bun.
          </p>
        </header>

        <Stepper currentStep={3} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8 items-start">
          <div className="space-y-6">
            <Step3Upsell
              productName={productName}
              productType={params?.slug || 'produs'}
              selection={selection}
              onSelectionChange={setSelection}
              onContinue={handleContinue}
              onUpsellChange={setUpsells}
            />
          </div>

          <div className="hidden lg:block">
            <PriceSidebar
              selection={selection}
              productName={productName}
              onContinue={handleContinue}
              continueLabel="Continuă la pasul 4"
              upsells={upsells}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky price + CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Preț estimat</p>
            <p className="text-xl font-bold text-gray-900">{mobileTotal.toFixed(2)} MDL</p>
            {upsells.length > 0 && <p className="text-[11px] text-gray-500">Upsell-uri selectate: {upsells.length}</p>}
          </div>
          <button
            onClick={handleContinue}
            className="bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-700"
          >
            Continuă
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500">Pasul 3 · Upsell inteligent · Recomandări dinamice</p>
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, label: 'Specificatii' },
    { id: 2, label: 'Personalizare' },
    { id: 3, label: 'Upsell' },
    { id: 4, label: 'Rezumat' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;
          return (
            <li key={step.id} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border transition ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : isDone
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {isDone ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{`Pasul ${step.id}`}</span>
                <span className="text-xs text-gray-500">{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
