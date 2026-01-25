'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, RefreshCw } from 'lucide-react';

// Helper functions pentru status mapping
const getStatusVariant = (status: string) => {
  const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    IN_PROGRESS: 'primary',
    READY: 'success',
    SHIPPED: 'primary',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };
  return variants[status] || 'default';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'În așteptare',
    CONFIRMED: 'Confirmat',
    IN_PROGRESS: 'În progres',
    READY: 'Gata',
    SHIPPED: 'Livrat',
    DELIVERED: 'Finalizat',
    CANCELLED: 'Anulat',
  };
  return labels[status] || status;
};

const getPaymentVariant = (status: string) => {
  const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    PENDING: 'warning',
    PAID: 'success',
    FAILED: 'danger',
    REFUNDED: 'info',
  };
  return variants[status] || 'default';
};

const getPaymentLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'În așteptare',
    PAID: 'Plătit',
    FAILED: 'Eșuat',
    REFUNDED: 'Rambursat',
  };
  return labels[status] || status;
};

interface OrderListItem {
  id: string;
  orderNumber?: string;
  total: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: { name: string; email: string };
  orderItems: { product: { name: string }; quantity: number }[];
}

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data to match OrderListItem interface
      const transformedOrders: OrderListItem[] = data.orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total || 0,
        currency: order.currency || 'MDL',
        customerName: order.customer?.name || 'Unknown',
        customerEmail: order.customer?.email || 'Unknown',
        status: order.status,
        paymentStatus: order.paymentStatus || 'PENDING',
        createdAt: order.createdAt,
        user: order.user,
        orderItems: order.orderItems || [],
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.orderNumber?.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term) ||
          order.customerEmail.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
  };

  const columns: Column<OrderListItem>[] = [
    {
      key: 'orderNumber',
      label: 'Comandă',
      render: (order) => (
        <div className="font-mono text-sm font-semibold">
          #{order.orderNumber || order.id.slice(-8)}
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Client',
      render: (order) => (
        <div>
          <div className="font-medium text-sm">{order.customerName}</div>
          <div className="text-gray-500 text-xs">{order.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (order) => (
        <span className="whitespace-nowrap font-semibold">
          {order.total.toFixed(2)} {order.currency || 'MDL'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order) => (
        <Badge variant={getStatusVariant(order.status)}>
          {getStatusLabel(order.status)}
        </Badge>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Plată',
      render: (order) => (
        <Badge variant={getPaymentVariant(order.paymentStatus)}>
          {getPaymentLabel(order.paymentStatus)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Dată',
      sortable: true,
      render: (order) => (
        <span className="whitespace-nowrap text-sm">
          {new Date(order.createdAt).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acțiuni',
      align: 'right',
      render: (order) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/admin/orders/${order.id}`)}
        >
          Detalii
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comenzi</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestionează toate comenzile din platformă
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Reîncarcă
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Caută după ID, număr, nume, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Toate statusurile</option>
            <option value="PENDING">În așteptare</option>
            <option value="CONFIRMED">Confirmat</option>
            <option value="IN_PROGRESS">În progres</option>
            <option value="READY">Gata</option>
            <option value="SHIPPED">Livrat</option>
            <option value="DELIVERED">Finalizat</option>
            <option value="CANCELLED">Anulat</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Toate plățile</option>
            <option value="PENDING">Plată în așteptare</option>
            <option value="PAID">Plătit</option>
            <option value="FAILED">Eșuat</option>
            <option value="REFUNDED">Rambursat</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Afișate {filteredOrders.length} din {orders.length} comenzi
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table
          columns={columns}
          data={filteredOrders}
          rowKey="id"
          loading={loading}
          loadingMessage="Se încarcă comenzile..."
          emptyMessage="Nu există comenzi"
          bordered={false}
          responsive={true}
          clientSideSort={true}
          onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
        />
      </div>
    </div>
  );
}
