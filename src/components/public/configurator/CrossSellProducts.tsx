"use client";

import Link from 'next/link';
import { type CrossSellSuggestion } from '@/modules/configurator/useUpsellEngine';

interface CrossSellProductsProps {
  items: CrossSellSuggestion[];
}

export function CrossSellProducts({ items }: CrossSellProductsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Produse complementare</p>
          <p className="text-xs text-gray-600">Completează pachetul cu materiale asociate.</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">Cross-sell</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition flex flex-col">
            <div className="aspect-video rounded-md bg-gradient-to-br from-blue-50 via-white to-amber-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-500 text-sm mb-3">
              {item.name}
            </div>
            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-600 mb-3">{item.priceFrom}</p>
            <Link
              href={item.href}
              className="mt-auto inline-flex justify-center text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg py-2 hover:bg-blue-50"
            >
              Configurează
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
