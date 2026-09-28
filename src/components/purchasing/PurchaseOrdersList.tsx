'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { POFilters, type FilterState } from '@/components/purchasing/POFilters';

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseOrderRow {
  id: string;
  poNumber?: string | null;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  totalCost: number;
  currency: string;
  expectedDeliveryDate?: string | null;
  createdAt: string;
  supplier?: Supplier | null;
}

const defaultFilters: FilterState = {
  status: '',
  supplierId: '',
  search: '',
  fromDate: '',
  toDate: '',
};

export function PurchaseOrdersList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      if (response.ok) setSuppliers(Array.isArray(data.items) ? data.items : []);
    } catch (_error) {
      setSuppliers([]);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filters.status) params.set('status', filters.status);
      if (filters.supplierId) params.set('supplierId', filters.supplierId);
      if (filters.search) params.set('search', filters.search);
      if (filters.fromDate) params.set('fromDate', filters.fromDate);
      if (filters.toDate) params.set('toDate', filters.toDate);

      const response = await fetch(`/api/purchase-orders?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Failed to load purchase orders');
        setItems([]);
        return;
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSuppliers();
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [page, filters]);

  const handleQuickAction = async (row: PurchaseOrderRow, action: 'approve' | 'send' | 'receive' | 'cancel') => {
    try {
      const response = await fetch(`/api/purchase-orders/${row.id}/${action === 'receive' ? 'receive' : action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || 'Action failed');
        return;
      }
      toast.success('Action completed');
      void fetchOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const statusColor = useMemo(() => ({
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    SENT: 'bg-emerald-100 text-emerald-700',
    RECEIVED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
  }), []);

  return (
    <div className="space-y-5">
      <POFilters
        filters={filters}
        suppliers={suppliers}
        onChange={(next) => {
          setPage(1);
          setFilters(next);
        }}
        onReset={() => {
          setPage(1);
          setFilters(defaultFilters);
        }}
      />

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Expected Delivery</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading purchase orders...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No purchase orders match the selected filters.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200 align-middle">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.poNumber ?? row.id}</td>
                    <td className="px-4 py-3 text-slate-600">{row.supplier?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{Number(row.totalCost || 0).toFixed(2)} {row.currency}</td>
                    <td className="px-4 py-3 text-slate-700">{row.expectedDeliveryDate ? new Date(row.expectedDeliveryDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <a href={`/purchase-orders/${row.id}`} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
                          View
                        </a>
                        {row.status === 'DRAFT' && (
                          <button type="button" onClick={() => handleQuickAction(row, 'approve')} className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500">
                            Approve
                          </button>
                        )}
                        {(row.status === 'DRAFT' || row.status === 'PENDING_APPROVAL') && (
                          <button type="button" onClick={() => handleQuickAction(row, 'send')} className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500">
                            Send
                          </button>
                        )}
                        {row.status === 'SENT' && (
                          <button type="button" onClick={() => handleQuickAction(row, 'receive')} className="rounded bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-500">
                            Receive
                          </button>
                        )}
                        {row.status !== 'CANCELLED' && row.status !== 'RECEIVED' && (
                          <button type="button" onClick={() => handleQuickAction(row, 'cancel')} className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-slate-600">Page {page}</span>
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
