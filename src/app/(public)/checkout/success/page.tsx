'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Clock, FileText, ArrowRight, Mail, Phone, User } from 'lucide-react';

interface OrderDetails {
  id: string;
  orderNumber?: string;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  deliveryMethod: string;
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery?: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/cart');
      return;
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Eroare la încărcarea detaliilor comenzii');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare necunoscută');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  // Calculate estimated delivery date (10 days from now)
  const getEstimatedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă detaliile comenzii...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Eroare</h1>
          <p className="text-gray-600 mb-6">{error || 'Comanda nu a fost găsită'}</p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 bg-[#0066FF] text-white px-6 py-3 rounded-lg hover:bg-[#0052CC] transition-colors"
          >
            Înapoi la coș
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon and Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Comanda a fost plasată cu succes!
          </h1>
          <p className="text-xl text-gray-600">
            Mulțumim pentru comandă! Vei primi un email de confirmare la{' '}
            <span className="font-semibold text-[#0066FF]">{order.customerEmail}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          {/* Order Number */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Număr comandă</p>
              <p className="text-2xl font-bold text-gray-900">
                #{order.orderNumber || order.id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-[#0066FF]">
                {order.totalPrice.toLocaleString('ro-RO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                RON
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0066FF]" />
              Produse comandate
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">Cantitate: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {item.lineTotal.toFixed(2)} RON
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Livrare estimată
              </h3>
              <p className="text-gray-900 font-medium">
                {order.estimatedDelivery || getEstimatedDelivery()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Metoda: {order.deliveryMethod}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Metodă de plată
              </h3>
              <p className="text-gray-900 font-medium">{order.paymentMethod}</p>
              <p className="text-sm text-gray-500 mt-1">
                Status:{' '}
                {order.paymentMethod === 'card' ? 'Plătit' : 'În așteptare'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href={`/account/orders/${order.id}`}
            className="flex items-center justify-center gap-2 bg-[#0066FF] text-white px-6 py-4 rounded-lg hover:bg-[#0052CC] transition-colors font-semibold"
          >
            <FileText className="w-5 h-5" />
            Vezi detalii comandă
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center gap-2 bg-white text-[#0066FF] border-2 border-[#0066FF] px-6 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            Continuă cumpărăturile
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <Mail className="w-8 h-8 text-[#0066FF] mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Email de confirmare</h3>
            <p className="text-sm text-gray-600">
              Am trimis un email cu detaliile comenzii la adresa ta.
            </p>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-6">
            <Package className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Livrare asigurată</h3>
            <p className="text-sm text-gray-600">
              Vei primi notificări despre statusul comenzii prin email și SMS.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-6">
            <User className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Cont creat</h3>
            <p className="text-sm text-gray-600">
              Poți vizualiza comenzile în secțiunea{' '}
              <Link href="/account/orders" className="text-[#0066FF] font-medium">
                Contul meu
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Ai nevoie de ajutor?</h3>
          <p className="text-gray-600 mb-4">
            Echipa noastră este aici să te ajute cu orice întrebări despre comanda ta.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contact@sanduta.art"
              className="inline-flex items-center gap-2 text-[#0066FF] hover:text-[#0052CC] font-medium"
            >
              <Mail className="w-5 h-5" />
              contact@sanduta.art
            </a>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <a
              href="tel:+40123456789"
              className="inline-flex items-center gap-2 text-[#0066FF] hover:text-[#0052CC] font-medium"
            >
              <Phone className="w-5 h-5" />
              +40 123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
