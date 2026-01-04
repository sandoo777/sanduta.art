'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Eye, ShoppingBag } from 'lucide-react';
import { OrderSuccessSummary } from '@/components/public/checkout/OrderSuccessSummary';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  deliveryDate?: string;
  deliveryMethod: {
    name: string;
    estimatedDays: string;
  };
  paymentMethod: {
    name: string;
    type: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      router.push('/checkout');
      return;
    }

    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const session = await response.json();
          setIsLoggedIn(!!session?.user);
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
      }
    };

    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails({
            orderId: data.id,
            orderNumber: data.orderNumber,
            total: data.total,
            items: data.items || [],
            createdAt: new Date(data.createdAt).toLocaleDateString('ro-RO'),
            deliveryDate: data.estimatedDeliveryDate
              ? new Date(data.estimatedDeliveryDate).toLocaleDateString('ro-RO')
              : undefined,
            deliveryMethod: data.deliveryMethod || {
              name: 'Curier Standard',
              estimatedDays: '2-3 zile lucrătoare',
            },
            paymentMethod: data.paymentMethod || {
              name: 'Card bancar',
              type: 'card',
            },
          });
        } else {
          // Dacă comanda nu există, redirect la homepage
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    fetchOrderDetails();
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă detaliile comenzii...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping" />
              <CheckCircle className="w-20 h-20 md:w-24 md:h-24 text-green-600 relative" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Comanda ta a fost plasată cu succes!
          </h1>
          <p className="text-lg text-gray-600 mb-1">
            Ți-am trimis un email cu detaliile comenzii.
          </p>
          {orderDetails && (
            <p className="text-sm text-gray-500 mt-4">
              Număr comandă:{' '}
              <span className="font-mono font-bold text-[#0066FF]">
                {orderDetails.orderNumber}
              </span>
            </p>
          )}
        </div>

        {/* Order Summary */}
        {orderDetails && (
          <div className="mb-8">
            <OrderSuccessSummary
              items={orderDetails.items}
              total={orderDetails.total}
              deliveryMethod={orderDetails.deliveryMethod}
              paymentMethod={orderDetails.paymentMethod}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isLoggedIn && orderDetails && (
            <a
              href={`/account/orders/${orderDetails.orderId}`}
              className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Eye className="w-5 h-5" />
              Vezi comanda completă
            </a>
          )}

          <a
            href="/products"
            className="w-full border-2 border-[#0066FF] hover:bg-blue-50 text-[#0066FF] font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Înapoi la produse
          </a>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ai nevoie de ajutor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
              <a
                href="mailto:support@sanduta.art"
                className="text-[#0066FF] hover:underline text-sm"
              >
                support@sanduta.art
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Telefon</p>
              <a
                href="tel:+40123456789"
                className="text-[#0066FF] hover:underline text-sm"
              >
                +40 (123) 456-789
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
