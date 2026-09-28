"use client";

import { useEffect, useState } from 'react';

export interface JobMaterialUsageEntry {
  id: string;
  jobId: string;
  materialId: string;
  materialName: string;
  materialUnit: string;
  quantityUsed: number;
  unit: string;
  cost: number;
  createdAt: string;
}

export function JobMaterialUsageTable({ jobId }: { jobId: string }) {
  const [items, setItems] = useState<JobMaterialUsageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`/api/jobs/${jobId}/usage`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load usage details');
        const payload = await response.json();
        if (active) setItems(payload.items ?? []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading usage history…</div>;
  }

  if (items.length === 0) {
    return <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">No material usage recorded yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Material</th>
            <th className="px-4 py-3 font-medium">Qty</th>
            <th className="px-4 py-3 font-medium">Unit</th>
            <th className="px-4 py-3 font-medium">Cost</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="bg-white">
              <td className="px-4 py-3 text-slate-800">{item.materialName}</td>
              <td className="px-4 py-3 text-slate-700">{item.quantityUsed}</td>
              <td className="px-4 py-3 text-slate-700">{item.unit}</td>
              <td className="px-4 py-3 text-slate-700">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(item.cost)}</td>
              <td className="px-4 py-3 text-slate-500">{new Date(item.createdAt).toLocaleString('ro-RO')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
