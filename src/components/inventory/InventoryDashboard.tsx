"use client";

import { useEffect, useState } from 'react';

interface InventoryRecord {
  id: string;
  materialId: string;
  materialName: string;
  materialUnit: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  minStock: number;
  materialType: string | null;
  updatedAt: string;
  isLowStock: boolean;
}

export function InventoryDashboard() {
  const [items, setItems] = useState<InventoryRecord[]>([]);
  const [summary, setSummary] = useState({ total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load inventory');
        const payload = await response.json();
        setItems(payload.items ?? []);
        setSummary(payload.summary ?? { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
      })
      .catch(() => {
        setItems([]);
        setSummary({ total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading inventory…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Materials</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-700">Low stock</p>
          <p className="mt-2 text-2xl font-semibold text-amber-900">{summary.lowStock}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Out of stock</p>
          <p className="mt-2 text-2xl font-semibold text-red-900">{summary.outOfStock}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">Inventory value</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(summary.totalValue)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Min stock</th>
              <th className="px-4 py-3 font-medium">Unit cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No inventory records available.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="bg-white">
                  <td className="px-4 py-3 text-slate-800">{item.materialName}</td>
                  <td className="px-4 py-3 text-slate-700">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-slate-700">{item.minStock}</td>
                  <td className="px-4 py-3 text-slate-700">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(item.costPerUnit)}</td>
                  <td className="px-4 py-3">
                    {item.quantity === 0 ? (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Out of stock</span>
                    ) : item.isLowStock ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Low stock</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Healthy</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
