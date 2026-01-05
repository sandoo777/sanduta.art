'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/modules/cart/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryMethod: 'pickup',
    deliveryAddress: '',
    city: '',
    novaPoshtaWarehouse: '',
    paymentMethod: 'cash',
  });

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validare date
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
        throw new Error('Te rugăm completează toate câmpurile obligatorii');
      }

      if (formData.deliveryMethod === 'delivery' && !formData.deliveryAddress) {
        throw new Error('Te rugăm completează adresa de livrare');
      }

      if (formData.deliveryMethod === 'novaposhta' && !formData.novaPoshtaWarehouse) {
        throw new Error('Te rugăm selectează un depozit Nova Poshta');
      }

      // Prepară produsele
      const products = items.map((item) => ({
        product: {
          id: item.id,
          name: item.name,
          price: item.price,
        },
        quantity: item.quantity,
      }));

      // Trimite comanda
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          total,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          delivery_method: formData.deliveryMethod,
          delivery_address: formData.deliveryAddress,
          city: formData.city,
          novaposhta_warehouse: formData.novaPoshtaWarehouse,
          payment_method: formData.paymentMethod,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Eroare la crearea comenzii');
      }

      const data = await response.json();
      
      // Golește coșul și redirecționează la success
      clear();
      router.push(`/checkout/success?orderId=${data.order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'A apărut o eroare neașteptată';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0066FF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Înapoi la coș
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Finalizează comanda</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informații de contact</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nume complet *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                        placeholder="Ion Popescu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                        placeholder="ion@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                        placeholder="+373 (777) 888-99"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Metoda de livrare</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={formData.deliveryMethod === 'pickup'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#0066FF]"
                      />
                      <span className="text-gray-700">Ridicare din sediu (Chișinău)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={formData.deliveryMethod === 'delivery'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#0066FF]"
                      />
                      <span className="text-gray-700">Livrare la domiciliu</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="novaposhta"
                        checked={formData.deliveryMethod === 'novaposhta'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#0066FF]"
                      />
                      <span className="text-gray-700">Nova Poshta</span>
                    </label>
                  </div>

                  {/* Conditional fields based on delivery method */}
                  {formData.deliveryMethod === 'delivery' && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresa de livrare *
                        </label>
                        <input
                          type="text"
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                          placeholder="Str. Esempio, Nr. 123, Apt. 45"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Oraș
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                          placeholder="Chișinău"
                        />
                      </div>
                    </div>
                  )}

                  {formData.deliveryMethod === 'novaposhta' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selectează depozitul Nova Poshta *
                      </label>
                      <input
                        type="text"
                        name="novaPoshtaWarehouse"
                        value={formData.novaPoshtaWarehouse}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                        placeholder="ex: Depozitul 123"
                      />
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Metoda de plată</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#0066FF]"
                      />
                      <span className="text-gray-700">Plată cu numerar</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#0066FF]"
                      />
                      <span className="text-gray-700">Card de credit/debit</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0066FF] text-white py-3 rounded-lg font-semibold hover:bg-[#0052CC] disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Se procesează...' : 'Finalizează comanda'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rezumatul comenzii</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(item.price * item.quantity).toLocaleString('ro-RO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      MDL
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    {total.toLocaleString('ro-RO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    MDL
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livrare</span>
                  <span>Gratuit</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>
                    {total.toLocaleString('ro-RO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    MDL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
