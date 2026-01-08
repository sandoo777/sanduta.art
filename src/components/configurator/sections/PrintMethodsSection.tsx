'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ConfiguratorPrintMethod } from '@/modules/configurator/types';

interface PrintMethodsSectionProps {
  printMethods: ConfiguratorPrintMethod[];
  selected?: string;
  onChange: (printMethodId: string) => void;
}

const currency = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'MDL',
  minimumFractionDigits: 2,
});

export function PrintMethodsSection({
  printMethods,
  selected,
  onChange,
}: PrintMethodsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metodă de tipărire</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {printMethods.map((method) => {
            const isSelected = method.id === selected;
            return (
              <button
                key={method.id}
                onClick={() => onChange(method.id)}
                className={`group relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{method.name}</h4>
                    <Badge variant="info" size="sm" className="mt-1">
                      {method.type}
                    </Badge>
                  </div>
                  {isSelected && (
                    <Badge variant="primary">Selectat</Badge>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  {method.costPerM2 && (
                    <p>
                      Cost: <span className="font-medium text-slate-900">{currency.format(method.costPerM2)} / m²</span>
                    </p>
                  )}
                  {method.costPerSheet && (
                    <p>
                      Cost: <span className="font-medium text-slate-900">{currency.format(method.costPerSheet)} / coală</span>
                    </p>
                  )}
                  {(method.maxWidth || method.maxHeight) && (
                    <p className="text-xs text-slate-500">
                      Max: {method.maxWidth && `${method.maxWidth}mm L`}
                      {method.maxWidth && method.maxHeight && ' × '}
                      {method.maxHeight && `${method.maxHeight}mm H`}
                    </p>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute right-3 top-3 h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {printMethods.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Nicio metodă de tipărire disponibilă pentru configurația curentă.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
