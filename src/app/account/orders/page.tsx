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

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

          {!loading && orders.length === 0 ? (
            <Card className="text-center">
              <p className="text-gray-600 mb-4">У вас пока нет заказов</p>
              <a href="/products">
                <Button>Перейти к покупкам</Button>
              </a>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
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
