'use client';

import { useEffect, useState } from 'react';
import { useOrders } from '@/modules/orders/useOrders';
import { OrderStatusManager } from './components/OrderStatusManager';
import { PaymentStatusManager } from './components/PaymentStatusManager';
import { AssignOperator } from './components/AssignOperator';
import { OrderItemsManager } from './components/OrderItemsManager';
import { OrderFilesManager } from './components/OrderFilesManager';
import { OrderTimeline } from './components/OrderTimeline';
import { toast } from 'sonner';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  source: 'ONLINE' | 'OFFLINE';
  channel: 'WEB' | 'PHONE' | 'WALK_IN' | 'EMAIL';
  status: string;
  paymentStatus: string;
  totalPrice: number;
  currency: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: any[];
  files: any[];
  _count?: {
    orderItems: number;
    files: number;
  };
}

const getSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    ONLINE: 'Online',
    OFFLINE: 'Offline',
  };
  return labels[source] || source;
};

const getChannelLabel = (channel: string) => {
  const labels: Record<string, string> = {
    WEB: 'Web',
    PHONE: 'Telefon',
    WALK_IN: 'Vizita',
    EMAIL: 'Email',
  };
  return labels[channel] || channel;
};

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'files' | 'timeline'>('overview');

  const { getOrder } = useOrders();

  const loadOrder = async () => {
    setIsLoading(true);
    const result = await getOrder(params.id);
    if (result.success) {
      setOrder(result.data);
    } else {
      toast.error('Eroare la încărcare: ' + result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Se încarcă comanda...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Comanda nu a fost găsită</p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-block text-blue-600 hover:text-blue-700"
        >
          Înapoi la comenzi
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comanda {order.id}</h1>
            <p className="text-gray-600 mt-1">
              Client: {order.customerName} ({order.customerEmail})
            </p>
          </div>
        </div>
        <button
          onClick={loadOrder}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700
            rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <RefreshCw size={18} />
          Reîncarcă
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {order.totalPrice.toFixed(2)} {order.currency}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Sursă / Canal</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {getSourceLabel(order.source)} / {getChannelLabel(order.channel)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Articole</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {order._count?.orderItems || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Fișiere</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {order._count?.files || 0}
          </p>
        </div>
      </div>

      {/* Manager Cards */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestiune Comandă</h2>
        <div className="space-y-3">
          <OrderStatusManager
            orderId={order.id}
            currentStatus={order.status}
            onStatusChanged={(status) => setOrder({ ...order, status })}
          />
          <PaymentStatusManager
            orderId={order.id}
            currentPaymentStatus={order.paymentStatus}
            onPaymentStatusChanged={(status) => setOrder({ ...order, paymentStatus: status })}
          />
          <AssignOperator
            orderId={order.id}
            assignedToUserId={order.assignedTo?.id}
            assignedOperatorName={order.assignedTo?.name}
            onOperatorAssigned={() => loadOrder()}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['overview', 'items', 'files', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && 'Prezentare generală'}
              {tab === 'items' && 'Articole'}
              {tab === 'files' && 'Fișiere'}
              {tab === 'timeline' && 'Timeline'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informații Client
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nume</p>
                      <p className="text-gray-900 font-medium">
                        {order.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900 font-medium">
                        {order.customerEmail}
                      </p>
                    </div>
                    {order.customerPhone && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Telefon</p>
                        <p className="text-gray-900 font-medium">
                          {order.customerPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informații Comandă
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ID Comandă</p>
                      <p className="text-gray-900 font-mono font-medium">
                        {order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Creat</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {order.dueDate && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Data Scadenței</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(order.dueDate).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                    )}
                    {order.assignedTo && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Operator Alocat</p>
                        <p className="text-gray-900 font-medium">
                          {order.assignedTo.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <OrderItemsManager
              orderId={order.id}
              items={order.orderItems}
              onItemsChanged={loadOrder}
            />
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <OrderFilesManager
              orderId={order.id}
              files={order.files}
              onFilesChanged={loadOrder}
            />
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <OrderTimeline
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
              status={order.status}
              paymentStatus={order.paymentStatus}
              itemsCount={order._count?.orderItems || 0}
              filesCount={order._count?.files || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
