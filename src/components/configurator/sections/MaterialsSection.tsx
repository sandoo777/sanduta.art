'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ConfiguratorMaterial } from '@/modules/configurator/types';

interface MaterialsSectionProps {
  materials: Array<ConfiguratorMaterial & { effectiveCost: number }>;
  selected?: string;
  onChange: (materialId: string) => void;
}

const currency = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'MDL',
  minimumFractionDigits: 2,
});

export function MaterialsSection({ materials, selected, onChange }: MaterialsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Material</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {materials.map((material) => {
            const isSelected = material.id === selected;
            return (
              <button
                key={material.id}
                onClick={() => onChange(material.id)}
                className={`group relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-semibold text-slate-900">{material.name}</h4>
                  {isSelected && (
                    <Badge variant="primary" className="ml-2">
                      Selectat
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <p>Unitate: {material.unit}</p>
                  <p className="font-medium text-slate-900">
                    Cost: {currency.format(material.effectiveCost)} / {material.unit}
                  </p>
                  {material.priceModifier && material.priceModifier > 0 && (
                    <Badge variant="warning" size="sm">
                      +{currency.format(material.priceModifier)}
                    </Badge>
                  )}
                </div>

                {material.constraints && (
                  <div className="mt-2 text-xs text-slate-500">
                    {material.constraints.maxWidth && (
                      <p>Max lățime: {material.constraints.maxWidth}{material.constraints.unit}</p>
                    )}
                    {material.constraints.maxHeight && (
                      <p>Max înălțime: {material.constraints.maxHeight}{material.constraints.unit}</p>
                    )}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute right-3 top-3 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
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

        {materials.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Niciun material compatibil cu configurația curentă.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
