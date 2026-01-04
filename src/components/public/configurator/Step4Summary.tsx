"use client";

import { useMemo } from 'react';
import { SummaryPreview } from './SummaryPreview';
import { SummarySpecifications } from './SummarySpecifications';
import { SummaryUpsells } from './SummaryUpsells';
import { FinalPriceSidebar } from './FinalPriceSidebar';

export interface ConfiguratorSelection {
  productId: string;
  dimensions: string;
  material: string;
  finish: string;
  quantity: number;
  productionSpeed: string;
  unitPrice: number;
  totalPrice: number;
  previewUrl?: string;
  fileName?: string;
  fileStatus?: 'ok' | 'warning' | 'error' | 'pending';
}

export interface UpsellItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  quantity?: number;
}

interface Step4SummaryProps {
  selection: ConfiguratorSelection;
  upsells: UpsellItem[];
  currency?: string;
  vatIncluded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onUpload?: () => void;
  onRemoveUpsell?: (id: string) => void;
  onAddToCart?: () => void;
}

export function Step4Summary({
  selection,
  upsells,
  currency = 'RON',
  vatIncluded = true,
  loading,
  disabled,
  onUpload,
  onRemoveUpsell,
  onAddToCart,
}: Step4SummaryProps) {
  const upsellsTotal = useMemo(
    () => upsells.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [upsells]
  );

  const isDisabled = disabled || selection.fileStatus === 'error' || selection.fileStatus === 'pending';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezumat comandă</h1>
        <p className="text-gray-600">Verifică toate detaliile înainte de a adăuga produsul în coș.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Section */}
          <SummaryPreview
            fileName={selection.fileName}
            previewUrl={selection.previewUrl}
            status={selection.fileStatus}
            onUpload={onUpload}
          />

          {/* Specifications Section */}
          <SummarySpecifications
            dimensions={selection.dimensions}
            material={selection.material}
            finish={selection.finish}
            quantity={selection.quantity}
            productionSpeed={selection.productionSpeed}
            unitPrice={selection.unitPrice}
            totalPrice={selection.totalPrice}
            currency={currency}
          />

          {/* Upsells Section */}
          {upsells.length > 0 && (
            <SummaryUpsells items={upsells} currency={currency} onRemove={onRemoveUpsell} />
          )}

          {/* Production details info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Detalii importante</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Producția începe imediat după confirmarea plății</li>
                  <li>• Vei primi notificare pe email la fiecare etapă</li>
                  <li>• Echipa noastră verifică calitatea înainte de livrare</li>
                  <li>• Suport tehnic disponibil 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Right column */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8">
            <FinalPriceSidebar
              currency={currency}
              basePrice={selection.totalPrice}
              upsellsTotal={upsellsTotal}
              vatIncluded={vatIncluded}
              onAddToCart={onAddToCart}
              loading={loading}
              disabled={isDisabled}
            />

            {/* Trust signals */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Plată securizată</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Garanție de calitate</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Livrare rapidă</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isDisabled || loading}
          className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Se adaugă...' : 'Adaugă în coș'}
        </button>
      </div>
    </div>
  );
}
