'use client';

import React, { useState } from 'react';
import { Mail, Phone, User } from 'lucide-react';
import type { CustomerData } from '@/modules/checkout/useCheckout';

interface CheckoutCustomerFormProps {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
  errors?: Record<string, string>;
}

export function CheckoutCustomerForm({ data, onChange, errors = {} }: CheckoutCustomerFormProps) {
  const handleChange = (field: keyof CustomerData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const inputClasses = (fieldName: keyof CustomerData) =>
    `w-full px-4 py-2 border rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066FF] ${
      errors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-[#0066FF]">1</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Date personale</h2>
          <p className="text-sm text-gray-500">Informații de contact</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nume
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={data.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Ex: Ion"
                className={`${inputClasses('firstName')} pl-10`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prenume
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={data.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Ex: Popescu"
                className={`${inputClasses('lastName')} pl-10`}
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="ex@email.com"
              className={`${inputClasses('email')} pl-10`}
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+40 7XX XXX XXX"
              className={`${inputClasses('phone')} pl-10`}
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
            Informații opționale (pentru facturare)
          </p>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nume firmă
          </label>
          <input
            type="text"
            value={data.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Ex: SC Exemplu SRL"
            className={inputClasses('companyName')}
          />
        </div>

        {/* Tax ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CUI / CIF
          </label>
          <input
            type="text"
            value={data.taxId || ''}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="Ex: RO12345678"
            className={inputClasses('taxId')}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
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
              Datele tale sunt protejate și criptate. Noi nu partajez informațiile cu terți.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
