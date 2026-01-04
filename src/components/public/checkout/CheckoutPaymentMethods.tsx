'use client';

import React, { useState } from 'react';
import { CreditCard, DollarSign, Banknote, Home } from 'lucide-react';
import type { PaymentMethod } from '@/modules/checkout/useCheckout';

interface CheckoutPaymentMethodsProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const PAYMENT_OPTIONS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Card Bancar',
    type: 'card',
    icon: '💳',
  },
  {
    id: 'cod',
    name: 'Ramburs (COD)',
    type: 'cash',
    icon: '💵',
  },
  {
    id: 'transfer',
    name: 'Transfer Bancar',
    type: 'transfer',
    icon: '🏦',
  },
  {
    id: 'pickup',
    name: 'Plată la Sediu',
    type: 'pickup',
    icon: '🏢',
  },
];

export function CheckoutPaymentMethods({
  selected,
  onSelect,
}: CheckoutPaymentMethodsProps) {
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvc: '',
  });

  const handleCardChange = (field: keyof typeof cardData, value: string) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-[#0066FF]">3</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Metoda de plată</h2>
          <p className="text-sm text-gray-500">Cum vrei să plătești</p>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {PAYMENT_OPTIONS.map((method) => (
          <button
            key={method.id}
            onClick={() => {
              onSelect(method);
              if (method.id === 'card') {
                setShowCardForm(true);
              } else {
                setShowCardForm(false);
              }
            }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selected?.id === method.id
                ? 'border-[#0066FF] bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
                {method.id === 'cod' && (
                  <p className="text-xs text-gray-500">Plătești la livrare</p>
                )}
                {method.id === 'transfer' && (
                  <p className="text-xs text-gray-500">Plătești înaintea livrării</p>
                )}
                {method.id === 'card' && (
                  <p className="text-xs text-gray-500">Plătești acum în siguranță</p>
                )}
                {method.id === 'pickup' && (
                  <p className="text-xs text-gray-500">Plătești la ridicare</p>
                )}
              </div>
              {selected?.id === method.id && (
                <svg className="w-5 h-5 text-[#0066FF] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Card Form (if card payment selected) */}
      {showCardForm && selected?.id === 'card' && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Detalii card</h3>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Număr card
              </label>
              <input
                type="text"
                value={formatCardNumber(cardData.cardNumber)}
                onChange={(e) =>
                  handleCardChange('cardNumber', e.target.value.replace(/\s/g, ''))
                }
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
            </div>

            {/* Card Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume pe card
              </label>
              <input
                type="text"
                value={cardData.cardName}
                onChange={(e) => handleCardChange('cardName', e.target.value.toUpperCase())}
                placeholder="ION POPESCU"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
            </div>

            {/* Expiry & CVC Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data expirare
                </label>
                <input
                  type="text"
                  value={formatExpiryDate(cardData.expiryDate)}
                  onChange={(e) =>
                    handleCardChange(
                      'expiryDate',
                      e.target.value.replace(/\D/g, '').slice(0, 4)
                    )
                  }
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  value={cardData.cvc}
                  onChange={(e) =>
                    handleCardChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))
                  }
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded p-3 flex gap-2">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-green-700">
                Datele cardului sunt procesate de Stripe cu cel mai înalt nivel de
                securitate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details (if transfer selected) */}
      {selected?.id === 'transfer' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Date transfer bancar</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-600">Beneficiar: <span className="font-medium text-gray-900">SC Sanduta Art SRL</span></p>
            </div>
            <div>
              <p className="text-gray-600">IBAN: <span className="font-medium text-gray-900 font-mono">RO12 ABCD 1234 5678 9012</span></p>
            </div>
            <div>
              <p className="text-gray-600">BIC: <span className="font-medium text-gray-900">ABCDROXX</span></p>
            </div>
            <div className="pt-2 border-t border-blue-200 mt-2">
              <p className="text-gray-600">Mențiune: <span className="font-medium text-gray-900">Order #[OrderID]</span></p>
            </div>
          </div>
        </div>
      )}

      {/* General Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex gap-3">
          <CreditCard className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700">
              Datele de plată sunt criptate și securizate. Nu stochem informații complete despre card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
