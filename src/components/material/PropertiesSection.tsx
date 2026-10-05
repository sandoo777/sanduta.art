'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import type { MaterialFormData } from '@/lib/validations/admin';
import { useMaterialPropertyLists } from '@/modules/settings/useMaterialPropertyLists';
import { MaterialPropertyQuickControls } from '@/components/material/MaterialPropertyQuickControls';
import type { FormatOption } from './types';

type PropertiesSectionProps = {
  unit: string;
  showThicknessField: boolean;
  showDensityField: boolean;
  showFormatSelector: boolean;
  showWidthField: boolean;
  showHeightField: boolean;
  formatCategory: string;
  formatCategoryOptions: Array<{ id: string; code: string; name: string; enabled?: boolean }>;
  onFormatCategoryChange: (value: string) => void;
  filteredFormats: FormatOption[];
  formats: FormatOption[];
  formatId?: string;
  formatName?: string;
  width_mm?: string;
  height_mm?: string;
  onFormatNameDirty: () => void;
};

export function PropertiesSection({
  unit,
  showThicknessField,
  showDensityField,
  showFormatSelector,
  showWidthField,
  showHeightField,
  formatCategory,
  formatCategoryOptions,
  onFormatCategoryChange,
  filteredFormats,
  formats,
  formatId,
  formatName,
  width_mm,
  height_mm,
  onFormatNameDirty,
}: PropertiesSectionProps) {
  const form = useFormContext<MaterialFormData>();
  const {
    lists,
    mutating,
    error,
    addValue,
    updateValue,
    deleteValue,
    clearError,
  } = useMaterialPropertyLists(true);

  const selectedFinish = (form.watch('finishType') ?? '').trim();
  const selectedColor = (form.watch('colorName') ?? '').trim();
  const selectedTexture = (form.watch('texture') ?? '').trim();

  const finishOptions = Array.from(new Set([
    ...lists.finishes.filter((item) => item.enabled).map((item) => item.value),
    selectedFinish,
  ].filter(Boolean)));
  const colorOptions = Array.from(new Set([
    ...lists.colors.filter((item) => item.enabled).map((item) => item.value),
    selectedColor,
  ].filter(Boolean)));
  const textureOptions = Array.from(new Set([
    ...lists.textures.filter((item) => item.enabled).map((item) => item.value),
    selectedTexture,
  ].filter(Boolean)));

  return (
    <div className="space-y-5">
      {(showFormatSelector || showWidthField || showHeightField) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Format</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <FormLabel htmlFor="formatCategory">Categoria formatului</FormLabel>
              <select
                id="formatCategory"
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
                <FormLabel htmlFor="formatId">Format</FormLabel>
                <select
                  id="formatId"
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

            {showFormatSelector && (
              <div>
                <FormLabel htmlFor="formatName">Format name</FormLabel>
                <Input
                  id="formatName"
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
                <FormLabel htmlFor="width_mm">Lățime (mm)</FormLabel>
                <Input
                  id="width_mm"
                  {...form.register('width_mm')}
                  value={width_mm ?? ''}
                  type="number"
                  min="1"
                />
              </div>
            )}

            {showHeightField && (
              <div>
                <FormLabel htmlFor="height_mm">Înălțime (mm)</FormLabel>
                <Input
                  id="height_mm"
                  {...form.register('height_mm')}
                  value={height_mm ?? ''}
                  type="number"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Proprietăți Fizice</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="finishType">Finisaj suprafață</FormLabel>
            <select
              id="finishType"
              {...form.register('finishType')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Nespecificat —</option>
              {finishOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <MaterialPropertyQuickControls
              type="finishes"
              label="finisaj"
              items={lists.finishes}
              selectedValue={selectedFinish}
              mutating={mutating}
              error={error}
              addValue={addValue}
              updateValue={updateValue}
              deleteValue={deleteValue}
              clearError={clearError}
              onApplyValue={(value) => form.setValue('finishType', value, { shouldDirty: true, shouldValidate: true })}
            />
            <p className="mt-1 text-xs text-gray-400">Tipul de finisaj vizibil</p>
          </div>

          {showThicknessField && (
            <div>
              <FormLabel htmlFor="thickness">Grosime (mm)</FormLabel>
              <Input
                id="thickness"
                {...form.register('thickness')}
                type="number"
                step="0.01"
                min="0"
                placeholder="ex: 0.08"
              />
              <p className="mt-1 text-xs text-gray-400">
                {unit === 'sheet' ? 'ex: carton 350g ≈ 0.4mm' : unit === 'm2' || unit === 'meter' ? 'ex: vinyl autoadeziv ≈ 0.08' : ''}
              </p>
            </div>
          )}

          {showDensityField && (
            <div>
              <FormLabel htmlFor="density">Densitate (g/m²)</FormLabel>
              <Input
                id="density"
                {...form.register('density')}
                type="number"
                step="0.1"
                min="0"
                placeholder="ex: 80"
              />
              <p className="mt-1 text-xs text-gray-400">
                {unit === 'sheet' ? 'ex: hârtie A4 80g/m²' : unit === 'm2' || unit === 'meter' ? 'ex: banner 440g/m²' : ''}
              </p>
            </div>
          )}

          <div>
            <FormLabel htmlFor="colorName">Culoare</FormLabel>
            <select
              id="colorName"
              {...form.register('colorName')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Nespecificat —</option>
              {colorOptions.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <MaterialPropertyQuickControls
              type="colors"
              label="culoare"
              items={lists.colors}
              selectedValue={selectedColor}
              mutating={mutating}
              error={error}
              addValue={addValue}
              updateValue={updateValue}
              deleteValue={deleteValue}
              clearError={clearError}
              onApplyValue={(value) => form.setValue('colorName', value, { shouldDirty: true, shouldValidate: true })}
            />
            <p className="mt-1 text-xs text-gray-400">Culoare principală a materialului</p>
          </div>

          <div>
            <FormLabel htmlFor="texture">Textură</FormLabel>
            <select
              id="texture"
              {...form.register('texture')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Nespecificat —</option>
              {textureOptions.map((texture) => (
                <option key={texture} value={texture}>{texture}</option>
              ))}
            </select>
            <MaterialPropertyQuickControls
              type="textures"
              label="textură"
              items={lists.textures}
              selectedValue={selectedTexture}
              mutating={mutating}
              error={error}
              addValue={addValue}
              updateValue={updateValue}
              deleteValue={deleteValue}
              clearError={clearError}
              onApplyValue={(value) => form.setValue('texture', value, { shouldDirty: true, shouldValidate: true })}
            />
            <p className="mt-1 text-xs text-gray-400">Textură principală a materialului</p>
          </div>
        </div>
      </div>
    </div>
  );
}
