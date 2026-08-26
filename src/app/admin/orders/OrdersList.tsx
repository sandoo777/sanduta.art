'use client';

import { useState, useEffect, useCallback } from 'react';
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

/** Computes per-unit material cost from a MaterialUsage row */
function computeUsageCost(usage: MaterialUsageSummary): number {
  return Number(usage.cost ?? 0);
}

/** Aggregates all material usages from all production jobs of an order */
function aggregateOrderMaterials(jobs: OrderListItem['productionJobs']) {
  if (!jobs || jobs.length === 0) return { names: [], totalCost: 0, totalUsed: 0, unit: '' };

  const allUsages = jobs.flatMap((j) => j.materialUsages ?? []);
  if (allUsages.length === 0) return { names: [], totalCost: 0, totalUsed: 0, unit: '' };

  const totalCost = allUsages.reduce((sum, u) => sum + computeUsageCost(u), 0);
  const totalUsed = allUsages.reduce((sum, u) => sum + u.totalUsed, 0);
  const names = [...new Set(allUsages.map((u) => u.material.name))];
  // Use first unit as representative (most orders have a single material type)
  const unit = allUsages[0]?.unit ?? '';

  return { names, totalCost, totalUsed, unit };
}

interface MaterialUsageSummary {
  id: string;
  quantity: number;
  unit: string;
  wastePercent: number;
  totalUsed: number;
  cost: number;
  material: {
    id: string;
    name: string;
    category: { id: string; name: string } | null;
    pricePerSqm: number | null;
    pricePerMeter: number | null;
    pricePerUnit: number | null;
  };
}

interface RawApiOrder {
  id: string;
  orderNumber?: string;
  totalPrice?: number;
  total?: number;
  currency?: string;
  customer?: { name: string; email: string };
  status: string;
  paymentStatus?: string;
  createdAt: string;
  user?: { name: string; email: string };
  orderItems?: { product: { name: string }; quantity: number }[];
  productionJobs?: OrderListItem['productionJobs'];
}

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
  productionJobs?: Array<{
    id: string;
    name: string;
    status: string;
    estimatedMinutes?: number | null;
    estimatedCost?: string | null;
    outsourcedCost?: string | number | null;
    outsourcedProfit?: string | number | null;
    printMethod?: {
      id: string;
      name: string;
      isOutsourced?: boolean;
      termenFurnizor?: string | null;
    } | null;
    machine?: { id: string; name: string; equipmentType: string; status: string } | null;
    materialUsages?: MaterialUsageSummary[];
  }>;
}

function aggregateOutsource(jobs: OrderListItem['productionJobs']) {
  const outsourcedJobs = (jobs ?? []).filter((job) => job.printMethod?.isOutsourced);
  if (outsourcedJobs.length === 0) {
    return { suppliers: [] as string[], totalSupplierCost: 0, totalProfit: 0 };
  }

  const suppliers = [...new Set(outsourcedJobs.map((job) => job.printMethod?.name || 'Outsource'))];
  const totalSupplierCost = outsourcedJobs.reduce((sum, job) => sum + Number(job.outsourcedCost ?? 0), 0);
  const totalProfit = outsourcedJobs.reduce((sum, job) => sum + Number(job.outsourcedProfit ?? 0), 0);

  return { suppliers, totalSupplierCost, totalProfit };
}

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const filterOrders = useCallback(() => {
    let filtered = [...orders];

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

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
      const transformedOrders: OrderListItem[] = data.orders.map((order: RawApiOrder) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.totalPrice || order.total || 0,
        currency: order.currency || 'MDL',
        customerName: order.customer?.name || 'Unknown',
        customerEmail: order.customer?.email || 'Unknown',
        status: order.status,
        paymentStatus: order.paymentStatus || 'PENDING',
        createdAt: order.createdAt,
        user: order.user,
        orderItems: order.orderItems || [],
        productionJobs: order.productionJobs || [],
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
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
      render: (order) => {
        const normalizedTotal = Number(order.total ?? 0);
        const displayTotal = Number.isFinite(normalizedTotal) ? normalizedTotal : 0;

        return (
          <span className="whitespace-nowrap font-semibold">
            {displayTotal.toFixed(2)} {order.currency || 'MDL'}
          </span>
        );
      },
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
      key: 'production',
      label: 'Producție',
      render: (order) => {
        const jobs = order.productionJobs ?? [];
        if (jobs.length === 0) return <span className="text-xs text-gray-400">-</span>;
        const machines = jobs.filter((j) => j.machine).map((j) => j.machine!);
        const uniqueMachines = machines.filter(
          (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
        );
        return (
          <div className="space-y-1">
            {uniqueMachines.slice(0, 2).map((m) => (
              <div key={m.id} className="flex items-center gap-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                    m.status === 'AVAILABLE' ? 'bg-green-500' :
                    m.status === 'BUSY'      ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                />
                <span className="text-xs text-gray-700 truncate max-w-[100px]">{m.name}</span>
              </div>
            ))}
            {uniqueMachines.length > 2 && (
              <span className="text-xs text-gray-400">+{uniqueMachines.length - 2} mai multe</span>
            )}
            {uniqueMachines.length === 0 && (
              <span className="text-xs text-gray-400">{jobs.length} job{jobs.length > 1 ? 'uri' : ''}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'materials',
      label: 'Materiale',
      render: (order) => {
        const { names, totalCost, totalUsed, unit } = aggregateOrderMaterials(order.productionJobs);
        if (names.length === 0) return <span className="text-xs text-gray-400">-</span>;
        const unitLabel = unit === 'sqm' ? 'm²' : unit === 'meter' ? 'm' : 'buc';
        return (
          <div className="space-y-1">
            {names.slice(0, 2).map((name) => (
              <span
                key={name}
                className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700 truncate max-w-[110px]"
                title={name}
              >
                {name}
              </span>
            ))}
            {names.length > 2 && (
              <span className="text-xs text-gray-400">+{names.length - 2}</span>
            )}
            <div className="flex flex-wrap gap-1 mt-0.5">
              {totalUsed > 0 && (
                <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  {totalUsed.toFixed(2)} {unitLabel}
                </span>
              )}
              {totalCost > 0 && (
                <span className="inline-block rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                  {totalCost.toFixed(2)} MDL
                </span>
              )}
            </div>
          </div>
        );
      },
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
      key: 'outsource',
      label: 'Outsource',
      render: (order) => {
        const { suppliers, totalSupplierCost, totalProfit } = aggregateOutsource(order.productionJobs);
        if (suppliers.length === 0) return <span className="text-xs text-gray-400">-</span>;

        return (
          <div className="space-y-1">
            <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {suppliers[0]}
            </span>
            {suppliers.length > 1 && (
              <span className="text-xs text-gray-400">+{suppliers.length - 1} furnizor(i)</span>
            )}
            <div className="flex flex-wrap gap-1 mt-0.5">
              <span className="inline-block rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                Cost: {totalSupplierCost.toFixed(2)} MDL
              </span>
              <span className="inline-block rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-700">
                Profit: {totalProfit.toFixed(2)} MDL
              </span>
            </div>
          </div>
        );
      },
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
