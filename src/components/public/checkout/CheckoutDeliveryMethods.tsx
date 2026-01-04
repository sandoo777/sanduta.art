'use client';

import React from 'react';
import { Truck, Package, MapPin } from 'lucide-react';
import type { DeliveryMethod } from '@/modules/checkout/useCheckout';

interface CheckoutDeliveryMethodsProps {
  selected: DeliveryMethod | null;
  onSelect: (method: DeliveryMethod) => void;
}

const DELIVERY_OPTIONS: DeliveryMethod[] = [
  {
    id: 'standard',
    name: 'Curier Standard',
    estimatedDays: '2–3 zile lucratoare',
    price: 35,
  },
  {
    id: 'express',
    name: 'Curier Express',
    estimatedDays: 'Următoarea zi lucrătoare',
    price: 75,
  },
  {
    id: 'pickup',
    name: 'Ridicare din sediu',
    estimatedDays: 'După producție (max 10 zile)',
    price: 0,
  },
];

export function CheckoutDeliveryMethods({
  selected,
  onSelect,
}: CheckoutDeliveryMethodsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-[#0066FF]">2</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Metode livrare</h2>
          <p className="text-sm text-gray-500">Alege cum vrei să primești comanda</p>
        </div>
      </div>

      {/* Delivery Methods Grid */}
      <div className="space-y-3">
        {DELIVERY_OPTIONS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selected?.id === method.id
                ? 'border-[#0066FF] bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {method.id === 'standard' && (
                  <Truck className="w-6 h-6 text-[#0066FF]" />
                )}
                {method.id === 'express' && (
                  <Truck className="w-6 h-6 text-[#FACC15]" />
                )}
                {method.id === 'pickup' && (
                  <MapPin className="w-6 h-6 text-green-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 mb-1">{method.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{method.estimatedDays}</p>

                {method.id === 'pickup' && (
                  <p className="text-xs text-gray-500">
                    📍 Adresa: Str. Exemplu 123, București, sector 1
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex-shrink-0 text-right">
                <div className="font-semibold text-gray-900">
                  {method.price > 0 ? `+${method.price} RON` : 'Gratuit'}
                </div>
                {selected?.id === method.id && (
                  <svg className="w-5 h-5 text-[#0066FF] ml-auto mt-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex gap-3">
          <Package className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700">
              Toate pachetele sunt asigurate și urmărite. Vei primi notificare prin email și SMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
