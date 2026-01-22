'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardContent, CardFooter, Input, FormField } from '@/components/ui';
import { useCartStore } from '@/modules/cart/cartStore';

// Zod Schema pentru validare checkout
const checkoutSchema = z.object({
  customerName: z.string().min(3, 'Numele trebuie să conțină minim 3 caractere'),
  customerEmail: z.string().email('Adresa de email este invalidă'),
  customerPhone: z.string().regex(/^(\+373|0)[0-9]{8}$/, 'Număr de telefon invalid (ex: +373 777 888 99)'),
  deliveryMethod: z.enum(['pickup', 'delivery', 'novaposhta']),
  deliveryAddress: z.string().optional(),
  city: z.string().optional(),
  novaPoshtaWarehouse: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card']),
}).refine((data) => {
  if (data.deliveryMethod === 'delivery' && !data.deliveryAddress) {
    return false;
  }
  return true;
}, {
  message: 'Adresa de livrare este obligatorie',
  path: ['deliveryAddress'],
}).refine((data) => {
  if (data.deliveryMethod === 'novaposhta' && !data.novaPoshtaWarehouse) {
    return false;
  }
  return true;
}, {
  message: 'Depozitul Nova Poshta este obligatoriu',
  path: ['novaPoshtaWarehouse'],
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deliveryMethod: 'pickup',
      deliveryAddress: '',
      city: '',
      novaPoshtaWarehouse: '',
      paymentMethod: 'cash',
    }
  });

  const deliveryMethod = watch('deliveryMethod');

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    setError(null);

    try {
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
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          delivery_method: data.deliveryMethod,
          delivery_address: data.deliveryAddress,
          city: data.city,
          novaposhta_warehouse: data.novaPoshtaWarehouse,
          payment_method: data.paymentMethod,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Eroare la crearea comenzii');
      }

      const responseData = await response.json();
      
      // Golește coșul și redirecționează la success
      clear();
      router.push(`/checkout/success?orderId=${responseData.order.id}`);
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
            <Card>
              <CardContent className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informații de contact</h2>
                    <div className="space-y-4">
                      <FormField
                        label="Nume complet"
                        error={errors.customerName?.message}
                        required
                      >
                        <Input
                          type="text"
                          placeholder="Ion Popescu"
                          {...register('customerName')}
                        />
                      </FormField>

                      <FormField
                        label="Email"
                        error={errors.customerEmail?.message}
                        required
                      >
                        <Input
                          type="email"
                          placeholder="ion@example.com"
                          {...register('customerEmail')}
                        />
                      </FormField>

                      <FormField
                        label="Telefon"
                        error={errors.customerPhone?.message}
                        required
                      >
                        <Input
                          type="tel"
                          placeholder="+373 777 888 99"
                          {...register('customerPhone')}
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Metoda de livrare</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="pickup"
                          {...register('deliveryMethod')}
                          className="w-4 h-4 text-[#0066FF]"
                        />
                        <span className="text-gray-700">Ridicare din sediu (Chișinău)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="delivery"
                          {...register('deliveryMethod')}
                          className="w-4 h-4 text-[#0066FF]"
                        />
                        <span className="text-gray-700">Livrare la domiciliu</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="novaposhta"
                          {...register('deliveryMethod')}
                          className="w-4 h-4 text-[#0066FF]"
                        />
                        <span className="text-gray-700">Nova Poshta</span>
                      </label>
                    </div>

                    {/* Conditional fields based on delivery method */}
                    {deliveryMethod === 'delivery' && (
                      <div className="mt-4 space-y-4">
                        <FormField
                          label="Adresa de livrare"
                          error={errors.deliveryAddress?.message}
                          required
                        >
                          <Input
                            type="text"
                            placeholder="Str. Esempio, Nr. 123, Apt. 45"
                            {...register('deliveryAddress')}
                          />
                        </FormField>
                        <FormField
                          label="Oraș"
                          error={errors.city?.message}
                        >
                          <Input
                            type="text"
                            placeholder="Chișinău"
                            {...register('city')}
                          />
                        </FormField>
                      </div>
                    )}

                    {deliveryMethod === 'novaposhta' && (
                      <div className="mt-4">
                        <FormField
                          label="Selectează depozitul Nova Poshta"
                          error={errors.novaPoshtaWarehouse?.message}
                          required
                        >
                          <Input
                            type="text"
                            placeholder="ex: Depozitul 123"
                            {...register('novaPoshtaWarehouse')}
                          />
                        </FormField>
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
                          value="cash"
                          {...register('paymentMethod')}
                          className="w-4 h-4 text-[#0066FF]"
                        />
                        <span className="text-gray-700">Plată cu numerar</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="card"
                          {...register('paymentMethod')}
                          className="w-4 h-4 text-[#0066FF]"
                        />
                        <span className="text-gray-700">Card de credit/debit</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t pt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={loading}
                    >
                      Finalizează comanda
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Rezumatul comenzii</h2>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
