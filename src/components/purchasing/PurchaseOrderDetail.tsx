'use client';

import { useEffect, useState } from 'react';
import { PurchaseOrderActions } from '@/components/purchasing/PurchaseOrderActions';

interface PurchaseOrderLine {
  id: string;
  materialId: string;
  quantity: number;
  unit: string;
  unitCost: number;
  lineTotal: number;
  material?: { name?: string; sku?: string } | null;
}

interface PurchaseOrderEvent {
  id: string;
  eventType: string;
  message: string;
  createdAt: string;
}

interface PurchaseOrderDetailData {
  id: string;
  poNumber: string | null;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  totalCost: number;
  currency: string;
  expectedDeliveryDate: string | null;
  createdAt: string;
  lastResponse?: string | null;
  supplier?: {
    id: string;
    name: string;
    email?: string | null;
    phones?: Array<string | { number?: string | null; name?: string | null }>;
    address?: string | null;
    website?: string | null;
    preferredChannel?: 'email' | 'phone' | 'chat' | 'web' | null;
    defaultLeadTimeDays?: number | null;
  } | null;
  lines?: PurchaseOrderLine[];
  events?: PurchaseOrderEvent[];
}

export function PurchaseOrderDetail({ purchaseOrderId }: { purchaseOrderId: string }) {
  const [order, setOrder] = useState<PurchaseOrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/purchase-orders/${purchaseOrderId}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data?.error || 'Unable to load purchase order');
          return;
        }
        setOrder(data.item ?? data.order ?? data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load purchase order');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [purchaseOrderId]);

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Loading purchase order...</div>;
  if (error || !order) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error || 'Purchase order not found'}</div>;

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    SENT: 'bg-emerald-100 text-emerald-700',
    RECEIVED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
  };
  const supplierPhones = Array.isArray(order?.supplier?.phones)
    ? order.supplier.phones.map((phone) => typeof phone === 'string' ? phone : phone?.number ?? '').filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium uppercase tracking-wide text-indigo-600">Purchase order</div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{order.poNumber ?? order.id}</h1>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColor[order.status]}`}>{order.status}</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Supplier</div>
            <div className="mt-1 font-semibold text-slate-900">{order.supplier?.name ?? 'Unknown supplier'}</div>
            <div className="text-sm text-slate-600">{order.supplier?.email ?? 'No email'}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{Number(order.totalCost).toFixed(2)} {order.currency}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Expected delivery</div>
            <div className="mt-1 font-semibold text-slate-900">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Order lines</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Unit cost</th>
                <th className="px-3 py-2">Line total</th>
              </tr>
            </thead>
            <tbody>
              {(order.lines ?? []).map((line) => (
                <tr key={line.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">{line.material?.name ?? line.materialId}</td>
                  <td className="px-3 py-2">{line.quantity}</td>
                  <td className="px-3 py-2">{line.unit}</td>
                  <td className="px-3 py-2">{Number(line.unitCost).toFixed(2)}</td>
                  <td className="px-3 py-2">{Number(line.lineTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Actions</h2>
        <PurchaseOrderActions order={order} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Supplier info</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div><span className="font-medium text-slate-800">Name:</span> {order.supplier?.name ?? '—'}</div>
            <div><span className="font-medium text-slate-800">Email:</span> {order.supplier?.email ?? '—'}</div>
            <div><span className="font-medium text-slate-800">Phones:</span> {supplierPhones.join(', ') || '—'}</div>
            <div><span className="font-medium text-slate-800">Website:</span> {order.supplier?.website ?? '—'}</div>
            <div><span className="font-medium text-slate-800">Address:</span> {order.supplier?.address ?? '—'}</div>
            <div><span className="font-medium text-slate-800">Preferred channel:</span> {order.supplier?.preferredChannel ?? 'email'}</div>
            <div><span className="font-medium text-slate-800">Default lead time:</span> {order.supplier?.defaultLeadTimeDays ?? '—'} days</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Audit log</h2>
          <div className="space-y-3">
            {(order.events ?? []).map((event) => (
              <div key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="font-medium text-slate-800">{event.eventType}</div>
                <div className="mt-1 text-slate-600">{event.message}</div>
                <div className="mt-1 text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {!order.events?.length && <div className="text-sm text-slate-500">No events yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
