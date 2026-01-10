'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import { PageTitle, StatusBadge, Card, Button } from '@/components/ui';

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  trackingNumber: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

type FilterType = 'all' | 'processing' | 'production' | 'completed' | 'cancelled';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login?callbackUrl=/account/orders');
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (orders: Order[]) => {
    if (filter === 'all') return orders;
    
    return orders.filter(order => {
      const status = order.status.toUpperCase();
      
      if (filter === 'processing') {
        return ['PENDING', 'IN_PREPRODUCTION', 'IN_DESIGN'].includes(status);
      }
      
      if (filter === 'production') {
        return ['IN_PRODUCTION', 'IN_PRINTING', 'QUALITY_CHECK'].includes(status);
      }
      
      if (filter === 'completed') {
        return status === 'DELIVERED' || status === 'READY_FOR_DELIVERY';
      }
      
      if (filter === 'cancelled') {
        return status === 'CANCELLED';
      }
      
      return true;
    });
  };

  const filteredOrders = filterOrders(orders);

  const getFilterCounts = () => {
    return {
      all: orders.length,
      processing: orders.filter(o => ['PENDING', 'IN_PREPRODUCTION', 'IN_DESIGN'].includes(o.status.toUpperCase())).length,
      production: orders.filter(o => ['IN_PRODUCTION', 'IN_PRINTING', 'QUALITY_CHECK'].includes(o.status.toUpperCase())).length,
      completed: orders.filter(o => ['DELIVERED', 'READY_FOR_DELIVERY'].includes(o.status.toUpperCase())).length,
      cancelled: orders.filter(o => o.status.toUpperCase() === 'CANCELLED').length,
    };
  };

  const counts = getFilterCounts();

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <PageTitle>Мои заказы</PageTitle>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          {!loading && orders.length > 0 && (
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => setFilter('all')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    filter === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Все заказы
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                    {counts.all}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('processing')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    filter === 'processing'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  В обработке
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                    {counts.processing}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('production')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    filter === 'production'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  В производстве
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                    {counts.production}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    filter === 'completed'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Завершенные
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                    {counts.completed}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    filter === 'cancelled'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Отмененные
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                    {counts.cancelled}
                  </span>
                </button>
              </nav>
            </div>
          )}

          {!loading && orders.length === 0 ? (
            <Card className="text-center">
              <p className="text-gray-600 mb-4">У вас пока нет заказов</p>
              <a href="/products">
                <Button>Перейти к покупкам</Button>
              </a>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="text-center">
              <p className="text-gray-600">Нет заказов в этой категории</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} padding="lg">
                  <div className="flex flex-wrap justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        Заказ #{order.id.slice(0, 8)}
                      </h2>
                      <p className="text-sm text-gray-600">
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
                      <p className="text-2xl font-bold text-blue-600">
                        {order.total.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Статус заказа</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Статус оплаты</p>
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Статус доставки</p>
                      <StatusBadge status={order.deliveryStatus} />
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Трек-номер:</span>{' '}
                        <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Товары:</p>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            {item.product.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-gray-600">Количество: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">
                            {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <a href={`/account/orders/${order.id}`}>
                      <Button fullWidth>Просмотреть детали заказа</Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
