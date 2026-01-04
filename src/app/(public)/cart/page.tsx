'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CartList } from '@/components/public/cart/CartList';
import { CartSummary } from '@/components/public/cart/CartSummary';
import { useCartStore } from '@/modules/cart/cartStore';

export default function CartPage() {
  const { items } = useCartStore();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/produse"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0066FF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Înapoi la produse
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Coșul tău</h1>
          {items.length > 0 && (
            <p className="text-gray-600 mt-2">
              {items.length} {items.length === 1 ? 'produs' : 'produse'} în coș
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - 2 columns */}
          <div className="lg:col-span-2">
            <CartList />
          </div>

          {/* Summary - 1 column */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>

        {/* Additional Information - Only show when cart has items */}
        {items.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Timp de producție</h3>
                  <p className="text-sm text-gray-600">
                    Fiecare produs are timpul de producție specificat. Comenzile complexe pot necesita mai mult timp.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Garanție calitate</h3>
                  <p className="text-sm text-gray-600">
                    Toate produsele sunt verificate înainte de livrare. Oferim garanție pentru materialele și finisajele utilizate.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Suport clienți</h3>
                  <p className="text-sm text-gray-600">
                    Echipa noastră este disponibilă pentru a te ajuta cu orice întrebări despre comandă sau produse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trust Section - Only show when cart has items */}
        {items.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                De ce să alegi Sanduta.art?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <div className="text-3xl font-bold text-[#0066FF] mb-2">100%</div>
                  <div className="text-sm text-gray-600">Produse personalizate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0066FF] mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Suport clienți</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0066FF] mb-2">500+</div>
                  <div className="text-sm text-gray-600">Comenzi livrate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Summary */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600">Total comandă</div>
              <div className="text-xl font-bold text-[#0066FF]">
                {new Intl.NumberFormat('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(useCartStore.getState().getTotals().total)}
              </div>
            </div>
            <Link
              href="/checkout"
              className="bg-[#0066FF] text-white rounded-lg py-3 px-6 font-semibold hover:bg-[#0052CC] transition-colors inline-flex items-center gap-2"
            >
              Finalizează
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
