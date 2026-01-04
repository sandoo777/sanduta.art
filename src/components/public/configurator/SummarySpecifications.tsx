"use client";

import type { ReactElement } from 'react';

interface SummarySpecificationsProps {
  dimensions: string;
  material: string;
  finish: string;
  quantity: number;
  productionSpeed: string;
  unitPrice: number;
  totalPrice: number;
  currency?: string;
}

function formatMoney(value: number, currency = 'RON') {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(value);
}

const labels = {
  dimension: 'Dimensiune',
  material: 'Material',
  finishes: 'Finisaje',
  quantity: 'Cantitate',
  productionSpeed: 'Timp producție',
  unitPrice: 'Preț / buc',
  total: 'Preț total',
};

const icons: Record<string, ReactElement> = {
  dimension: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
    </svg>
  ),
  material: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 7l8-4 8 4-8 4-8-4z" />
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 12l8 4 8-4" />
    </svg>
  ),
  finishes: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
    </svg>
  ),
  quantity: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
    </svg>
  ),
  productionSpeed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 3" />
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  ),
  unitPrice: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3c1.657 0 3-1.343 3-3" />
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m6-6h-3m-6 0H6" />
    </svg>
  ),
  total: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.5 0-4.5 2-4.5 4.5S9.5 17 12 17s4.5-2 4.5-4.5S14.5 8 12 8z" />
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 1v3m0 16v3m8-11h-3m-10 0H1" />
    </svg>
  ),
};

export function SummarySpecifications({ 
  dimensions, 
  material, 
  finish, 
  quantity, 
  productionSpeed, 
  unitPrice, 
  totalPrice, 
  currency = 'RON' 
}: SummarySpecificationsProps) {
  const items = [
    { label: 'Dimensiune', value: dimensions, icon: 'dimension' },
    { label: 'Material', value: material, icon: 'material' },
    { label: 'Finisaje', value: finish, icon: 'finishes' },
    { label: 'Cantitate', value: `${quantity} buc`, icon: 'quantity' },
    { label: 'Timp producție', value: productionSpeed, icon: 'productionSpeed' },
    { label: 'Preț / buc', value: formatMoney(unitPrice, currency), icon: 'unitPrice' },
    { label: 'Preț total', value: formatMoney(totalPrice, currency), icon: 'total' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Specificații selectate</h3>
          <p className="text-sm text-gray-600">Verifică opțiunile alese pentru comandă.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.icon} className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              {icons[item.icon]}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
