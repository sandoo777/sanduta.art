'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui';

interface OrderItem {
  id: number;
  quantity: number;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    image_url: string | null;
  };
}

interface OrderData {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paynetSessionId: string | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
  delivery: {
    address: string;
    city: string;
    county: string | null;
    postalCode: string;
    trackingNumber: string | null;
  } | null;
  payment: {
    status: string;
    method: string;
    amount: number;
  } | null;
  orderItems: OrderItem[];
}

interface Props {
  order: OrderData;
}

export default function OrderDetailClient({ order }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [reordering, setReordering] = useState(false);

  const handleReorder = () => {
    setReordering(true);
    
    // Add all items from order to cart
    order.orderItems.forEach(item => {
      // Add product multiple times based on quantity
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product as any); // Type assertion for compatibility
      }
    });

    setTimeout(() => {
      setReordering(false);
      router.push('/checkout');
    }, 500);
  };

  const getStatusBadgeColor = (status: string) => {
    const normalized = status.toUpperCase();
    switch (normalized) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
      case 'IN_PRODUCTION':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => router.push('/account/orders')}
        className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Înapoi la comenzi
      </button>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Comandă #{order.orderNumber}</h1>
            <p className="text-gray-600">
              {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-600">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Status Comandă</p>
            <Badge variant="warning">{order.status}</Badge>
          </div>
          {order.payment && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Status Plată</p>
              <Badge variant="success">{order.payment.status}</Badge>
            </div>
          )}
          {order.delivery?.trackingNumber && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Tracking</p>
              <p className="font-mono text-sm">{order.delivery.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Tracking Number */}
        {order.delivery?.trackingNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-700 mb-1">Număr tracking</p>
                <p className="font-mono font-semibold text-lg">{order.delivery.trackingNumber}</p>
              </div>
              <a
                href={`https://www.sameday.ro/awb-tracking?awb=${order.delivery.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Urmărește coletul
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Produse</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-700">
                        ${item.product.price.toFixed(2)} × {item.quantity}
                      </p>
                      <p className="font-semibold text-lg">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-blue-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleReorder}
              disabled={reordering}
              className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {reordering ? (
                'Se adaugă în coș...'
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Comandă din nou
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Information */}
        <div className="space-y-6">
          {/* Customer Info */}
          {order.customer && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Informații Contact</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nume</p>
                  <p className="font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
                {order.customer.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="font-medium">{order.customer.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Info */}
          {order.delivery && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Adresă Livrare</h2>
              <div className="space-y-1 text-sm text-gray-700">
                <p>{order.delivery.address}</p>
                <p>{order.delivery.city}, {order.delivery.county}</p>
                <p>{order.delivery.postalCode}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          {order.payment && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Informații Plată</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Metodă</p>
                  <p className="font-medium">{order.payment.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant="success">{order.payment.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sumă</p>
                  <p className="font-medium">${order.payment.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
