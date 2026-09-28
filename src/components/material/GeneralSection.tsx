'use client';

import { Plus, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import type { MaterialFormData } from '@/lib/validations/admin';
import CategoryTreeSelector from '@/app/admin/materials/_components/CategoryTreeSelector';
import type { CategoryChangeHandler, FormatCategoryOption, FormatOption } from './types';

type GeneralSectionProps = {
  categoryId: string;
  categorySelectorKey: number;
  onCategoryChange: CategoryChangeHandler;
  onOpenQuickCategory: () => void;
  skuLoading: boolean;
  onGenerateSku: () => void;
  unit: string;
  formatCategory: string;
  formatCategoryOptions: FormatCategoryOption[];
  onFormatCategoryChange: (value: string) => void;
  showFormatSelector: boolean;
  showWidthField: boolean;
  showHeightField: boolean;
  filteredFormats: FormatOption[];
  formats: FormatOption[];
  formatId?: string;
  formatName?: string;
  width_mm?: string;
  height_mm?: string;
  onFormatNameDirty: () => void;
};

export function GeneralSection({
  categoryId,
  categorySelectorKey,
  onCategoryChange,
  onOpenQuickCategory,
  skuLoading,
  onGenerateSku,
  unit,
  formatCategory,
  formatCategoryOptions,
  onFormatCategoryChange,
  showFormatSelector,
  showWidthField,
  showHeightField,
  filteredFormats,
  formats,
  formatId,
  formatName,
  width_mm,
  height_mm,
  onFormatNameDirty,
}: GeneralSectionProps) {
  const form = useFormContext<MaterialFormData>();

  useEffect(() => {
    const derived: 'AREA_BASED' | 'DIRECT' =
      unit === 'm2' || unit === 'meter' ? 'AREA_BASED' : 'DIRECT';
    form.setValue('consumptionType', derived);
  }, [form, unit]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FormLabel>Nume material *</FormLabel>
          <Input {...form.register('name')} placeholder="ex: PVC Frontlit 510g" />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <FormLabel>Categorie *</FormLabel>
          <div className="flex gap-2">
            <div className="flex-1">
              <CategoryTreeSelector
                key={categorySelectorKey}
                value={categoryId}
                onChange={onCategoryChange}
                error={form.formState.errors.categoryId?.message}
              />
            </div>
            <button
              type="button"
              onClick={onOpenQuickCategory}
              className="group flex h-[42px] w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:border-blue-500 hover:bg-gray-50"
              title="Adaugă categorie nouă"
            >
              <Plus className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 hover:bg-gray-50">
          <input
            type="checkbox"
            {...form.register('active')}
            className="h-4 w-4 rounded"
          />
          <div>
            <div className="text-sm font-medium">Activ</div>
            <div className="text-xs text-gray-500">Disponibil</div>
          </div>
        </label>

        <div>
          <FormLabel>SKU</FormLabel>
          <div className="flex gap-2">
            <Input {...form.register('sku')} placeholder="MAT-001" className="flex-1" />
            <button
              type="button"
              onClick={onGenerateSku}
              disabled={!categoryId || skuLoading}
              className="group flex h-[42px] w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:border-blue-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Regenerează SKU"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 group-hover:text-blue-600 ${skuLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">Generat automat din categorie. Modifică manual dacă e necesar.</p>
        </div>

        <div>
          <FormLabel>Unitate de Măsură *</FormLabel>
          <select
            {...form.register('unit')}
            aria-label="Measurement unit"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <optgroup label="Suport de imprimare (cost bazat pe arie)">
              <option value="m2">Metru pătrat (m²) — vinyl, banner, PVC</option>
              <option value="meter">Metru liniar (m) — materiale rol</option>
              <option value="sheet">Coală (sheet) — hârtie, carton</option>
            </optgroup>
            <optgroup label="Cerneală &amp; Chimie (consum direct)">
              <option value="kg">Kilogram (kg)</option>
              <option value="gram">Gram (g)</option>
              <option value="liter">Litru (L)</option>
              <option value="ml">Mililitru (mL)</option>
            </optgroup>
            <optgroup label="Consumabile (consum direct)">
              <option value="pcs">Bucăți (buc) — plăci, pânze, consumabile</option>
            </optgroup>
          </select>
          {form.formState.errors.unit && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.unit.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {unit === 'm2' || unit === 'meter'
              ? 'ℹ️ Cost calculat automat pe arie în producție'
              : 'ℹ️ Cost calculat pe cantitate consumată'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FormLabel>Categoria formatului</FormLabel>
          <select
            aria-label="Format category"
            value={formatCategory}
            onChange={(event) => onFormatCategoryChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toate formaturile</option>
            {formatCategoryOptions.map((category) => (
              <option key={category.id} value={category.code}>{category.name} ({category.code})</option>
            ))}
          </select>
        </div>

        {showFormatSelector && (
          <div>
            <FormLabel>Format</FormLabel>
            <select
              {...form.register('formatId')}
              aria-label="Format select"
              value={formatId ?? ''}
              onChange={(event) => {
                const nextId = event.target.value;
                form.setValue('formatId', nextId);
                if (!nextId) {
                  form.setValue('formatName', '');
                  form.setValue('width_mm', '');
                  form.setValue('height_mm', '');
                  return;
                }

                const selected = formats.find((format) => format.id === nextId);
                if (selected) {
                  form.setValue('width_mm', String(selected.width_mm));
                  form.setValue('height_mm', selected.height_mm == null ? '' : String(selected.height_mm));
                  form.setValue('formatName', selected.name);
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— fără format —</option>
              {filteredFormats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.name} ({format.width_mm}{format.height_mm != null ? `×${format.height_mm}` : ''} mm)
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Selectează formatul standard pentru calculul ariei și a pierderilor.</p>
            {unit === 'sheet' && (
              <p role="status" className="mt-1 text-xs text-amber-700">
                Pentru COALA, dimensiunile se preiau din Format. Selectează un format.
              </p>
            )}
          </div>
        )}
      </div>

      {(showFormatSelector || showWidthField || showHeightField) && (
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
          {showFormatSelector && (
            <div>
              <FormLabel>Format name</FormLabel>
              <Input
                {...form.register('formatName')}
                value={formatName ?? ''}
                onChange={(event) => {
                  onFormatNameDirty();
                  form.setValue('formatName', event.target.value);
                }}
                placeholder="210x297 mm"
              />
            </div>
          )}

          {showWidthField && (
            <div>
              <FormLabel>Lățime (mm)</FormLabel>
              <Input
                {...form.register('width_mm')}
                value={width_mm ?? ''}
                type="number"
                min="1"
              />
            </div>
          )}

          {showHeightField && (
            <div>
              <FormLabel>Înălțime (mm)</FormLabel>
              <Input
                {...form.register('height_mm')}
                value={height_mm ?? ''}
                type="number"
                min="1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
