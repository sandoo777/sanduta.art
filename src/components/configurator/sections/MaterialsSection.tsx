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
        <div className="grid gap-4 sm:grid-cols-2">
          {materials.map((material) => {
            const isSelected = material.id === selected;
            const previewThumbnail = material.thumbnailUrl ?? material.thumbnailImage ?? null;
            const previewMacroTexture = material.macroTextureUrl ?? material.macroTextureImage ?? null;

            return (
              <button
                key={material.id}
                type="button"
                onClick={() => onChange(material.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{material.name}</h4>
                    {material.colorName && (
                      <p className="mt-1 text-sm text-slate-600">
                        {material.colorName}{material.colorCode ? ` (${material.colorCode})` : ''}
                      </p>
                    )}
                  </div>
                  {isSelected && <Badge variant="primary">Selectat</Badge>}
                </div>

                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  {previewThumbnail ? (
                    <img
                      src={previewThumbnail}
                      alt={material.name}
                      className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
                      Fara thumbnail
                    </div>
                  )}
                  {previewMacroTexture ? (
                    <img
                      src={previewMacroTexture}
                      alt={`Textură ${material.name}`}
                      className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
                      Fara macro textura
                    </div>
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
