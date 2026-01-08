'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ConfiguratorFinishing } from '@/modules/configurator/types';

interface FinishingSectionProps {
  finishing: ConfiguratorFinishing[];
  selected: string[];
  onChange: (finishingIds: string[]) => void;
}

const currency = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'MDL',
  minimumFractionDigits: 2,
});

export function FinishingSection({ finishing, selected, onChange }: FinishingSectionProps) {
  const handleToggle = (finishingId: string) => {
    const isSelected = selected.includes(finishingId);
    if (isSelected) {
      onChange(selected.filter((id) => id !== finishingId));
    } else {
      onChange([...selected, finishingId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finisaje (opțional)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {finishing.map((item) => {
            const isSelected = selected.includes(item.id);
            const totalCost =
              (item.costFix ?? 0) +
              (item.costPerUnit ?? 0) +
              (item.costPerM2 ?? 0) +
              (item.priceModifier ?? 0);

            return (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`group relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-semibold text-slate-900">{item.name}</h4>
                  {isSelected && (
                    <Badge variant="success">Selectat</Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  {item.costFix && item.costFix > 0 && (
                    <p>Cost fix: {currency.format(item.costFix)}</p>
                  )}
                  {item.costPerUnit && item.costPerUnit > 0 && (
                    <p>Cost/unitate: {currency.format(item.costPerUnit)}</p>
                  )}
                  {item.costPerM2 && item.costPerM2 > 0 && (
                    <p>Cost/m²: {currency.format(item.costPerM2)}</p>
                  )}
                  {item.priceModifier && item.priceModifier > 0 && (
                    <Badge variant="warning" size="sm" className="mt-1">
                      +{currency.format(item.priceModifier)}
                    </Badge>
                  )}
                  {totalCost > 0 && (
                    <p className="font-medium text-slate-900">
                      Total: ~{currency.format(totalCost)}
                    </p>
                  )}
                </div>

                <div className="absolute right-3 top-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(item.id)}
                    className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {finishing.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Niciun finisaj compatibil cu configurația curentă.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
