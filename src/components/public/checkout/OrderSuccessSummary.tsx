'use client';

import React from 'react';
import { Package, Clock, CreditCard, Truck } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderSuccessSummaryProps {
  items: OrderItem[];
  total: number;
  deliveryMethod: {
    name: string;
    estimatedDays: string;
  };
  paymentMethod: {
    name: string;
    type: string;
  };
}

export function OrderSuccessSummary({
  items,
  total,
  deliveryMethod,
  paymentMethod,
}: OrderSuccessSummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
        <Package className="w-6 h-6 text-[#0066FF]" />
        <h2 className="text-xl font-bold text-gray-900">Detalii comandă</h2>
      </div>

      {/* Produse */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Produse comandate
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Cantitate: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900 ml-4">
                {item.totalPrice.toFixed(2)} RON
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-[#0066FF] to-blue-600 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center text-white">
          <span className="font-medium">Total comandă</span>
          <span className="text-2xl font-bold">{total.toFixed(2)} RON</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Livrare */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Truck className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Livrare</p>
            <p className="text-sm text-gray-700 mt-1">{deliveryMethod.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">
                {deliveryMethod.estimatedDays}
              </p>
            </div>
          </div>
        </div>

        {/* Plată */}
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
          <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Plată</p>
            <p className="text-sm text-gray-700 mt-1">{paymentMethod.name}</p>
            <p className="text-xs text-gray-600 mt-2">
              {paymentMethod.type === 'card' && 'Plată online procesată'}
              {paymentMethod.type === 'cash' && 'Plata la livrare'}
              {paymentMethod.type === 'transfer' && 'Transfer bancar'}
              {paymentMethod.type === 'pickup' && 'Plata la ridicare'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">📧</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Am trimis confirmarea pe email
            </p>
            <p className="text-sm text-gray-600">
              Verifică inbox-ul pentru toate detaliile comenzii și factura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
