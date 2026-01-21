'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useOrders } from '@/modules/orders/useOrders';
import { Search, Eye, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/types/models';

interface OrderListItem extends Order {
  _count?: {
    orderItems: number;
    files: number;
  };
}

const STATUS_OPTIONS = [
  { value: '', label: 'Toate statusurile' },
  { value: 'PENDING', label: 'În așteptare' },
  { value: 'CONFIRMED', label: 'Confirmat' },
  { value: 'IN_PROGRESS', label: 'În progres' },
  { value: 'READY', label: 'Gata' },
  { value: 'SHIPPED', label: 'Livrat' },
  { value: 'DELIVERED', label: 'Entregat' },
  { value: 'CANCELLED', label: 'Anulat' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Toate statusurile de plată' },
  { value: 'PENDING', label: 'În așteptare' },
  { value: 'PAID', label: 'Plătit' },
  { value: 'PARTIAL', label: 'Parțial plătit' },
  { value: 'REFUNDED', label: 'Returnat' },
];

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  
  const { getOrders } = useOrders();

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    const result = await getOrders();
    if (result.success) {
      setOrders(result.data);
    } else {
      toast.error('Eroare la încărcare: ' + result.error);
    }
    setIsLoading(false);
  }, [getOrders]);

  useEffect(() => {
    loadOrders();
     
  }, [loadOrders]);

  // Use useMemo for filtering to avoid cascading renders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(term) ||
          order.customerEmail.toLowerCase().includes(term) ||
          order.id.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Payment status filter
    if (paymentStatusFilter) {
      filtered = filtered.filter((order) => order.paymentStatus === paymentStatusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, paymentStatusFilter]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      READY: 'bg-green-100 text-green-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-200 text-green-900',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700',
      PAID: 'bg-green-50 text-green-700',
      PARTIAL: 'bg-orange-50 text-orange-700',
      REFUNDED: 'bg-red-50 text-red-700',
    };
    return colors[status] || 'bg-gray-50 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'În așteptare',
      CONFIRMED: 'Confirmat',
      IN_PROGRESS: 'În progres',
      READY: 'Gata',
      SHIPPED: 'Livrat',
      DELIVERED: 'Entregat',
      CANCELLED: 'Anulat',
    };
    return labels[status] || status;
  };

  const getPaymentLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'În așteptare',
      PAID: 'Plătit',
      PARTIAL: 'Parțial plătit',
      REFUNDED: 'Returnat',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comenzi</h1>
        <p className="text-gray-600 mt-1">Gestionează comenzile clienților</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cauta dupa nume, email sau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm
              bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm
              bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-end px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              {filteredOrders.length} comenzi
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Se încarcă comenzile...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">Nu sunt comenzi care să corespundă filtrelor</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID / Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plată</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {order.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {getPaymentLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.totalPrice.toFixed(2)} {order.currency}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5
                            bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200
                            transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          <span>Detalii</span>
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
