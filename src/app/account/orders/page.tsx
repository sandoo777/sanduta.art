'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageTitle, StatusBadge, Card, Button } from '@/components/ui';
import { Package, ShoppingBag, Search } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PageTitle>Comenzile Mele</PageTitle>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State - No Orders */}
      {!loading && orders.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nu ai comenzi încă
            </h2>
            <p className="text-gray-600 mb-6">
              Explorează catalogul nostru și creează prima ta comandă personalizată.
            </p>
            <Link href="/products">
              <Button size="lg" className="inline-flex items-center gap-2">
                <ShoppingBag size={20} />
                Descoperă Produsele
              </Button>
            </Link>
          </div>
        </Card>
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
              Toate comenzile
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
              În procesare
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
              În producție
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
              Finalizate
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
              Anulate
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                {counts.cancelled}
              </span>
            </button>
          </nav>
        </div>
      )}

      {/* Empty State - Filtered */}
      {!loading && orders.length > 0 && filteredOrders.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nicio comandă găsită
            </h3>
            <p className="text-gray-600">
              Nu există comenzi în această categorie.
            </p>
          </div>
        </Card>
      )}
      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} padding="lg">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">
                    Comandă #{order.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-600">
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
                  <p className="text-2xl font-bold text-blue-600">
                    {order.total.toLocaleString('ro-RO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} Lei
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
                    Status comandă
                  </p>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
                    Status plată
                  </p>
                  <StatusBadge status={order.paymentStatus} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
                    Status livrare
                  </p>
                  <StatusBadge status={order.deliveryStatus} />
                </div>
              </div>

              {order.trackingNumber && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Număr AWB:</span>{' '}
                    <span className="font-mono text-blue-700">{order.trackingNumber}</span>
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Package size={16} />
                  Produse comandate:
                </p>
                <div className="space-y-2">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        {item.product.image_url && (
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded border border-gray-200"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-gray-600">Cantitate: {item.quantity} buc.</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">
                        {(item.product.price * item.quantity).toLocaleString('ro-RO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} Lei
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="primary" fullWidth className="inline-flex items-center justify-center gap-2">
                    <Package size={18} />
                    Vezi Detalii Comandă
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
