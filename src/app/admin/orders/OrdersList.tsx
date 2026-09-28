'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOrders } from '@/modules/orders/useOrders';
import { toast } from 'sonner';
import type { OrderStatus } from '@prisma/client';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'PENDING', label: 'În așteptare' },
  { value: 'IN_PREPRODUCTION', label: 'În preproducție' },
  { value: 'IN_DESIGN', label: 'În design' },
  { value: 'IN_PRODUCTION', label: 'În producție' },
  { value: 'IN_PRINTING', label: 'În tipar' },
  { value: 'QUALITY_CHECK', label: 'Control calitate' },
  { value: 'READY_FOR_DELIVERY', label: 'Gata de livrare' },
  { value: 'DELIVERED', label: 'Livrat' },
  { value: 'CANCELLED', label: 'Anulat' },
];

interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  byPayment: Record<string, number>;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Helper functions pentru status mapping
const getStatusVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    PENDING: 'warning',
    IN_PREPRODUCTION: 'info',
    IN_DESIGN: 'info',
    IN_PRODUCTION: 'primary',
    IN_PRINTING: 'primary',
    QUALITY_CHECK: 'info',
    READY_FOR_DELIVERY: 'success',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };
  return variants[status] ?? 'default';
};

const getStatusLabel = (status: string) => {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
};

const getPaymentVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    PENDING: 'warning',
    PAID: 'success',
    FAILED: 'danger',
    REFUNDED: 'info',
  };
  return variants[status] ?? 'default';
};

const getPaymentLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'În așteptare',
    PAID: 'Plătit',
    FAILED: 'Eșuat',
    REFUNDED: 'Rambursat',
  };
  return labels[status] ?? status;
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
  const { updateStatus } = useOrders();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Debounce search
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async (page = 1, search = searchTerm, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const transformed: OrderListItem[] = (data.orders ?? []).map((order: RawApiOrder) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.totalPrice ?? order.total ?? 0,
        currency: order.currency ?? 'MDL',
        customerName: order.customer?.name ?? order.user?.name ?? 'Necunoscut',
        customerEmail: order.customer?.email ?? order.user?.email ?? '-',
        status: order.status,
        paymentStatus: order.paymentStatus ?? 'PENDING',
        createdAt: order.createdAt,
        user: order.user,
        orderItems: order.orderItems ?? [],
        productionJobs: order.productionJobs ?? [],
      }));

      setOrders(transformed);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Eroare la încărcarea comenzilor');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/stats');
      if (res.ok) setStats(await res.json());
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
    fetchStats();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when status filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    fetchOrders(1, searchTerm, value);
  };

  // Debounced search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchOrders(1, value, statusFilter), 400);
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const result = await updateStatus(orderId, newStatus as OrderStatus);
    if (result.success) {
      toast.success('Status actualizat');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      fetchStats();
    } else {
      toast.error('Eroare: ' + result.error);
    }
    setUpdatingId(null);
  };

  // Client-side payment filter (lightweight, no extra API call)
  const displayedOrders = paymentFilter === 'all'
    ? orders
    : orders.filter((o) => o.paymentStatus === paymentFilter);

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
        <div className="flex flex-col gap-1">
          <Badge variant={getStatusVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
          <select
            value={order.status}
            disabled={updatingId === order.id}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              handleQuickStatusChange(order.id, e.target.value);
            }}
            className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
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
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/orders/${order.id}`); }}
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
          onClick={() => { fetchOrders(pagination.page); fetchStats(); }}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Reîncarcă
        </Button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total comenzi</div>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-3 text-center">
            <div className="text-2xl font-bold text-amber-700">{stats.byStatus['PENDING'] ?? 0}</div>
            <div className="text-xs text-amber-600 mt-0.5">În așteptare</div>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {(stats.byStatus['IN_PRODUCTION'] ?? 0) + (stats.byStatus['IN_PRINTING'] ?? 0)}
            </div>
            <div className="text-xs text-blue-600 mt-0.5">În producție</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.byStatus['DELIVERED'] ?? 0}</div>
            <div className="text-xs text-green-600 mt-0.5">Livrate</div>
          </div>
        </div>
      )}

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
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Toate statusurile</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
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
          Pagina {pagination.page} din {pagination.totalPages} &nbsp;·&nbsp;
          {pagination.totalCount} comenzi total
          {paymentFilter !== 'all' && ` · ${displayedOrders.length} afișate (filtru plată activ)`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table
          columns={columns}
          data={displayedOrders}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-600">
            Comenzile {(pagination.page - 1) * PAGE_SIZE + 1}–{Math.min(pagination.page * PAGE_SIZE, pagination.totalCount)} din {pagination.totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <span className="text-sm font-medium text-gray-700 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Următor
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
