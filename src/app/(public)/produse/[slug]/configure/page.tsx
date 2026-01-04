'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Step1Specifications } from '@/components/public/configurator/Step1Specifications';
import { PriceSidebar } from '@/components/public/configurator/PriceSidebar';
import { 
  usePriceCalculator, 
  type PriceSelection,
  type Dimension,
  type Material,
  type Finish
} from '@/modules/configurator/usePriceCalculator';
import { useCartStore } from '@/modules/cart/cartStore';

export default function ConfigureProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const calculator = usePriceCalculator();
  const { getItem } = useCartStore();

  // Check if we're editing an existing cart item
  const editItemId = searchParams?.get('editItemId');

  const productName = useMemo(() => {
    const raw = params?.slug || 'produs';
    return raw
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, [params?.slug]);

  // Initialize selection state with default values
  const [selection, setSelection] = useState<PriceSelection>({
    dimension: 'A5',
    material: '170g',
    finishes: [],
    quantity: 500,
    productionSpeed: 'standard',
  });

  // Load existing cart item data if editing
  useEffect(() => {
    if (editItemId) {
      const item = getItem(editItemId);
      if (item && item.specifications) {
        // Map cart item specifications to PriceSelection format
        const dimensions = item.specifications.dimensions;
        let dimensionKey = 'A5'; // default
        
        // Try to determine dimension key from dimensions
        if (dimensions.width === 210 && dimensions.height === 297) dimensionKey = 'A4';
        else if (dimensions.width === 148 && dimensions.height === 210) dimensionKey = 'A5';
        else if (dimensions.width === 105 && dimensions.height === 148) dimensionKey = 'A6';
        
        setSelection({
          dimension: dimensionKey as Dimension,
          material: (item.specifications.material.id || '170g') as Material,
          finishes: (item.specifications.finishes?.map(f => f.id) || []) as Finish[],
          quantity: item.specifications.quantity,
          productionSpeed: 'standard', // Default if not stored
        });
      }
    }
  }, [editItemId, getItem]);

  const mobileTotal = useMemo(() => calculator.calcTotal(selection).total, [selection, calculator]);

  const handleContinue = () => {
    // If editing, store the editItemId in session storage for next steps
    if (editItemId) {
      sessionStorage.setItem('editItemId', editItemId);
    }
    router.push(`/produse/${params?.slug}/configure/step-2`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Edit Mode Banner */}
        {editItemId && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900">Modul editare</p>
                <p className="text-xs text-blue-700">Modifici un produs din coș. Modificările vor actualiza produsul existent.</p>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600">Acasă</Link>
          <span>/</span>
          <Link href="/produse" className="hover:text-blue-600">Produse</Link>
          <span>/</span>
          <Link href={`/produse/${params?.slug}`} className="hover:text-blue-600">{productName}</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Configurare</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">Pasul 1</span>
            <p className="text-sm text-gray-600">Specifică detaliile principale ale produsului</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Configurează {productName}</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Alege dimensiunea, materialul, finisajele și timpul de producție. Prețul se actualizează în timp real.
          </p>
        </header>

        {/* Stepper */}
        <Stepper currentStep={1} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8 items-start">
          <div className="space-y-6">
            <Step1Specifications selection={selection} onChange={setSelection} />
          </div>

          <div className="hidden lg:block">
            <PriceSidebar selection={selection} productName={productName} onContinue={handleContinue} />
          </div>
        </div>
      </div>

      {/* Mobile sticky price */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Preț estimat</p>
            <p className="text-xl font-bold text-gray-900">{mobileTotal.toFixed(2)} MDL</p>
          </div>
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg flex items-center gap-2"
          >
            Continuă
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500">Pasul 1 · Specificații · Preț live actualizat</p>
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, label: 'Specificatii' },
    { id: 2, label: 'Personalizare' },
    { id: 3, label: 'Fișiere' },
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
