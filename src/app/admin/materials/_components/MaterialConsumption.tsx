"use client";

import { Package } from "lucide-react";
import type { MaterialWithDetails } from "@/modules/materials/types";

interface MaterialConsumptionProps {
  material: MaterialWithDetails;
}

export function MaterialConsumption({ material }: MaterialConsumptionProps) {
  const resolveConsumptionType = (entry: MaterialWithDetails['consumption'][number]): string => {
    const reference = (entry.job?.name ?? '').toUpperCase();

    if (reference.startsWith('ADJ-')) return 'Manual Adjustment';
    if (reference.startsWith('CORR-')) return 'Inventory Correction';
    if (reference.startsWith('WASTE-') || reference.startsWith('SPOIL-')) return 'Waste/Spoilage';
    if (entry.job?.id) return 'Production Job';

    return 'Inventory Correction';
  };

  const resolveReference = (entry: MaterialWithDetails['consumption'][number]): string => {
    return entry.job?.name || entry.job?.id || '—';
  };

  const resolveUser = (entry: MaterialWithDetails['consumption'][number]): string => {
    return entry.job?.assignedTo?.name || 'Sistem';
  };

  const formatQuantity = (entry: MaterialWithDetails['consumption'][number]): string => {
    const quantity = Number.isFinite(entry.totalUsed) ? entry.totalUsed : entry.quantity;
    const displayedUnit = entry.unit || material.unit;
    return `-${Number(quantity).toLocaleString('ro-RO')} ${displayedUnit}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Istoric consum</h3>
      </div>

      {material.consumption.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Nu există consum înregistrat pentru acest material.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Reference</th>
                <th className="px-4 py-3 text-left font-medium">Quantity</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {material.consumption.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(entry.createdAt).toLocaleDateString('ro-RO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{resolveConsumptionType(entry)}</td>
                  <td className="px-4 py-3 text-gray-700">{resolveReference(entry)}</td>
                  <td className="px-4 py-3 font-medium text-red-700">{formatQuantity(entry)}</td>
                  <td className="px-4 py-3 text-gray-700">{resolveUser(entry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
