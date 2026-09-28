'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import type { MaterialFormData } from '@/lib/validations/admin';

type StockSectionProps = {
  unit: string;
  stock?: string;
  minStock?: string;
};

export function StockSection({ unit, stock, minStock }: StockSectionProps) {
  const form = useFormContext<MaterialFormData>();

  const stockValue = Number(stock ?? '0');
  const minStockValue = Number(minStock ?? '0');
  const lowStock = Number.isFinite(stockValue) && Number.isFinite(minStockValue) && minStockValue > 0 && stockValue <= minStockValue;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Stoc</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel>Stoc actual ({unit || 'unități'})</FormLabel>
            <Input {...form.register('stock')} type="number" step="0.01" min="0" />
          </div>
          <div>
            <FormLabel>Stoc minim — alertă ({unit || 'unități'})</FormLabel>
            <Input {...form.register('minStock')} type="number" step="0.01" min="0" />
            <p className="mt-1 text-xs text-gray-400">Notificare când stocul scade sub această valoare</p>
          </div>
        </div>
      </div>

      {lowStock && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Alertă stoc minim: {stockValue} {unit} ≤ {minStockValue} {unit}
        </div>
      )}
    </div>
  );
}
