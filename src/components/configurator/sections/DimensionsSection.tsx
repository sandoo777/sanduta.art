'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ProductDimensions } from '@/modules/products/productBuilder.types';
import type { ConfiguratorSelections, DimensionUnit } from '@/modules/configurator/types';
import { calculateAreaInSquareMeters } from '@/lib/configurator/dimensions';

interface DimensionsSectionProps {
  dimensions: ProductDimensions;
  currentDimension?: ConfiguratorSelections['dimension'];
  onChange: (dimension: ConfiguratorSelections['dimension']) => void;
}

export function DimensionsSection({
  dimensions,
  currentDimension,
  onChange,
}: DimensionsSectionProps) {
  const unit = currentDimension?.unit ?? dimensions.unit;
  const width = currentDimension?.width ?? dimensions.widthMin ?? 0;
  const height = currentDimension?.height ?? dimensions.heightMin ?? 0;

  const area = calculateAreaInSquareMeters(width, height, unit);

  const handleChange = (field: 'width' | 'height' | 'unit', value: string | number) => {
    onChange({
      width: field === 'width' ? Number(value) : width,
      height: field === 'height' ? Number(value) : height,
      unit: field === 'unit' ? (value as DimensionUnit) : unit,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dimensiuni produsului</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="width" className="mb-2 block text-sm font-medium text-slate-700">
              Lățime
            </label>
            <Input
              id="width"
              type="number"
              min={dimensions.widthMin}
              max={dimensions.widthMax}
              value={width}
              onChange={(e) => handleChange('width', e.target.value)}
              placeholder="Lățime"
            />
            {dimensions.widthMin && dimensions.widthMax && (
              <p className="mt-1 text-xs text-slate-500">
                {dimensions.widthMin} - {dimensions.widthMax} {unit}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="height" className="mb-2 block text-sm font-medium text-slate-700">
              Înălțime
            </label>
            <Input
              id="height"
              type="number"
              min={dimensions.heightMin}
              max={dimensions.heightMax}
              value={height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="Înălțime"
            />
            {dimensions.heightMin && dimensions.heightMax && (
              <p className="mt-1 text-xs text-slate-500">
                {dimensions.heightMin} - {dimensions.heightMax} {unit}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="unit" className="mb-2 block text-sm font-medium text-slate-700">
              Unitate
            </label>
            <Select
              id="unit"
              value={unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              options={[
                { value: 'mm', label: 'Milimetri (mm)' },
                { value: 'cm', label: 'Centimetri (cm)' },
                { value: 'm', label: 'Metri (m)' },
              ]}
            />
          </div>

          {area && (
            <div className="flex items-end">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-900">Suprafață calculată</p>
                <p className="text-2xl font-bold text-blue-600">{area.toFixed(2)} m²</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
