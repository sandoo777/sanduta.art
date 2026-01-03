'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  total: number;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  trackingNumber: string | null;
  paynetSessionId: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addToCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login?callbackUrl=/account/orders');
      return;
    }

    fetchOrder();
  }, [session, status, router, params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Заказ не найден');
        }
        throw new Error('Не удалось загрузить заказ');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = () => {
    if (!order) return;
    
    setReordering(true);
    
    // Add all items from order to cart
    order.orderItems.forEach(item => {
      // Convert product to match Product type
      const product = {
        ...item.product,
        image_url: item.product.image_url || undefined,
      };
      
      // Add product multiple times based on quantity
      for (let i = 0; i < item.quantity; i++) {
        addToCart(product);
      }
    });

    setTimeout(() => {
      setReordering(false);
      router.push('/checkout');
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
    };

    const statusLabels: { [key: string]: string } = {
      pending: 'Ожидает',
      processing: 'В обработке',
      completed: 'Выполнен',
      cancelled: 'Отменен',
      paid: 'Оплачен',
      failed: 'Ошибка',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Загрузка...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-medium">{error}</p>
              <button
                onClick={() => router.push('/account/orders')}
                className="mt-4 text-sm underline hover:no-underline"
              >
                ← Вернуться к заказам
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Back button */}
          <button
            onClick={() => router.push('/account/orders')}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Вернуться к заказам
          </button>

          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Заказ #{order.id.slice(0, 8)}</h1>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Итого</p>
                <p className="text-3xl font-bold text-blue-600">
                  {order.total.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Статус заказа</p>
                {getStatusBadge(order.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Статус оплаты</p>
                {getStatusBadge(order.paymentStatus)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Статус доставки</p>
                {getStatusBadge(order.deliveryStatus)}
              </div>
            </div>

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Трек-номер</p>
                    <p className="font-mono font-semibold text-lg">{order.trackingNumber}</p>
                  </div>
                  <a
                    href={`/api/delivery/novaposhta/track/${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Отследить посылку
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Товары</h2>
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
                            {item.product.price.toLocaleString('ru-RU')} ₽ × {item.quantity}
                          </p>
                          <p className="font-semibold text-lg">
                            {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Итого:</span>
                    <span className="text-blue-600">{order.total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                <button
                  onClick={handleReorder}
                  disabled={reordering}
                  className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {reordering ? (
                    'Добавление в корзину...'
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Заказать снова
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Контактная информация</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Имя</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Оплата</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Способ оплаты</p>
                    <p className="font-medium">
                      {order.paynetSessionId ? 'Карта (Paynet)' : 'Оплата при получении'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Статус</p>
                    {getStatusBadge(order.paymentStatus)}
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Доставка</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Служба доставки</p>
                    <p className="font-medium">Nova Poshta</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Статус</p>
                    {getStatusBadge(order.deliveryStatus)}
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Трек-номер</p>
                      <p className="font-mono text-sm">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
