'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import type { AddressData } from '@/modules/checkout/useCheckout';

interface CheckoutAddressFormProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Record<string, string>;
}

export function CheckoutAddressForm({ data, onChange, errors = {} }: CheckoutAddressFormProps) {
  const handleChange = (field: keyof AddressData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const inputClasses = (fieldName: keyof AddressData) =>
    `w-full px-4 py-2 border rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066FF] ${
      errors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  const countries = ['România', 'Ungaria', 'Bulgaria', 'Republica Moldova', 'Ucraina'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-[#0066FF]">2</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Adresă livrare</h2>
          <p className="text-sm text-gray-500">Unde vrei să primești comanda</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Country & City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Țară
              <span className="text-red-500">*</span>
            </label>
            <select
              value={data.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className={`${inputClasses('country')} appearance-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="">Selectează țara</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oraș
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Ex: București"
              className={inputClasses('city')}
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>
        </div>

        {/* Street & Number Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strada
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.street}
              onChange={(e) => handleChange('street', e.target.value)}
              placeholder="Ex: Calea Victoriei"
              className={inputClasses('street')}
            />
            {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Număr
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.number}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="Ex: 123"
              className={inputClasses('number')}
            />
            {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
          </div>
        </div>

        {/* Apartment & Postal Code Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bloc / Scara / Apartament
            </label>
            <input
              type="text"
              value={data.apt || ''}
              onChange={(e) => handleChange('apt', e.target.value)}
              placeholder="Ex: Bloc A, Scara 1, Ap. 10"
              className={inputClasses('apt')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cod poștal
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="Ex: 010101"
              className={inputClasses('postalCode')}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Full Address Preview */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex gap-2">
          <MapPin className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Previzualizare adresă
            </p>
            <p className="text-sm text-gray-900 font-medium">
              {data.street && data.number
                ? `${data.street} ${data.number}${data.apt ? `, ${data.apt}` : ''}, ${data.city}, ${data.country}`
                : 'Completează adresa pentru a vedea previzualizarea'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-700">
              Livrarea se face doar la adresele din România. Pentru alte țări, contactează suportul.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
