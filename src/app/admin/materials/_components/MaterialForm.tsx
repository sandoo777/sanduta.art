'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import { materialFormSchema, type MaterialFormData } from '@/lib/validations/admin';
import { useMaterials } from '@/modules/materials/useMaterials';
import type { Material } from '@/modules/materials/types';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';
import { Plus, RefreshCw } from 'lucide-react';
import CategoryTreeSelector from './CategoryTreeSelector';
import CategoryModal from './CategoryModal';
import { MaterialPropertiesEditor } from './MaterialPropertiesEditor';

interface MaterialFormProps {
  material?: Material;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialForm({ material, onClose, onSuccess }: MaterialFormProps) {
  const { createMaterial, updateMaterial, isLoading, lastError } = useMaterials();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategoryTree | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);
  const [categorySelectorKey, setCategorySelectorKey] = useState(0); // For forcing re-fetch

  const form = useForm({
    resolver: zodResolver(materialFormSchema) as never,
    defaultValues: {
      name: material?.name ?? '',
      categoryId: material?.categoryId ?? '',
      consumptionType: material?.consumptionType ?? 'AREA_BASED',
      active: material?.active ?? true,
      sku: material?.sku ?? '',
      unit: material?.unit ?? 'pcs',
      stock: material?.stock?.toString() ?? '0',
      minStock: material?.minStock?.toString() ?? '0',
      purchasePrice: material?.purchasePrice?.toString() ?? '',
      salePrice: material?.salePrice?.toString() ?? '',
      salePriceMode: material?.salePriceMode ?? 'amount',
      salePricePercent: material?.salePricePercent?.toString() ?? '',
      thickness: material?.thickness?.toString() ?? '',
      density: material?.density?.toString() ?? '',
      wastePercent: material?.wastePercent?.toString() ?? '3',
      notes: material?.notes ?? '',
      compatibleMethods: [],
      compatibleEquipment: [],
      packagingLabel: material?.packagingLabel ?? '',
      packagingQty: material?.packagingQty?.toString() ?? '',
      packagingPrice: material?.packagingPrice?.toString() ?? '',
      finishType: material?.finishType ?? '',
    },
  }) as unknown as UseFormReturn<MaterialFormData>;

  // Properties JSON state (managed outside react-hook-form to allow dynamic keys)
  const [properties, setProperties] = useState<Record<string, string | number | boolean>>(
    () => (material?.properties as Record<string, string | number | boolean> | null) ?? {}
  );

  const categoryId = useWatch({ control: form.control, name: 'categoryId' });
  const unit = useWatch({ control: form.control, name: 'unit' });
  const consumptionType = useWatch({ control: form.control, name: 'consumptionType' });
  const salePriceMode = useWatch({ control: form.control, name: 'salePriceMode' });
  const purchasePrice = useWatch({ control: form.control, name: 'purchasePrice' });
  const salePricePercent = useWatch({ control: form.control, name: 'salePricePercent' });
  const packagingQty = useWatch({ control: form.control, name: 'packagingQty' });
  const packagingPrice = useWatch({ control: form.control, name: 'packagingPrice' });
  const packagingLabel = useWatch({ control: form.control, name: 'packagingLabel' });
  const [skuLoading, setSkuLoading] = useState(false);

  async function generateSku(catId: string) {
    if (!catId) return;
    setSkuLoading(true);
    try {
      const res = await fetch(`/api/admin/materials/sku?categoryId=${encodeURIComponent(catId)}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const { sku } = await res.json() as { sku: string };
        form.setValue('sku', sku);
      }
    } catch {
      // non-critical
    } finally {
      setSkuLoading(false);
    }
  }

  // Auto-generate SKU when category is selected (only for new materials)
  useEffect(() => {
    if (!material && categoryId) {
      void generateSku(categoryId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, material]);

  // Auto-derive consumptionType from unit — no manual selection needed in UI
  useEffect(() => {
    const derived: 'AREA_BASED' | 'DIRECT' =
      unit === 'm2' || unit === 'meter' ? 'AREA_BASED' : 'DIRECT';
    form.setValue('consumptionType', derived);
  }, [unit, form]);

  // Auto-calculate purchasePrice from packaging (price per package / qty per package)
  useEffect(() => {
    const qty = parseFloat(packagingQty ?? '');
    const price = parseFloat(packagingPrice ?? '');
    if (!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
      const unitPrice = (price / qty).toFixed(4);
      form.setValue('purchasePrice', unitPrice);
    }
  }, [packagingQty, packagingPrice, form]);

  // Auto-calculate salePrice when mode is 'percent'
  useEffect(() => {
    if (salePriceMode !== 'percent') return;
    const purchase = parseFloat(purchasePrice ?? '');
    const percent = parseFloat(salePricePercent ?? '');
    if (!isNaN(purchase) && !isNaN(percent) && purchase > 0 && percent >= 0) {
      const computed = (purchase * (1 + percent / 100)).toFixed(2);
      form.setValue('salePrice', computed);
    }
  }, [salePriceMode, purchasePrice, salePricePercent, form]);

  function handleCategoryChange(categoryId: string, category: MaterialCategoryTree | null) {
    setSelectedCategory(category);
    form.setValue('categoryId', categoryId);
    
    // Clear fields that are not required by the new category
    if (category) {
      if (!category.requiresThickness) form.setValue('thickness', '');
      if (!category.requiresDensity) form.setValue('density', '');
      if (!category.requiresWastePercent) form.setValue('wastePercent', '');
    }
  }

  function handleQuickCategorySuccess(success: boolean) {
    setIsQuickCategoryModalOpen(false);
    if (success) {
      // Force CategoryTreeSelector to re-fetch categories
      setCategorySelectorKey(prev => prev + 1);
    }
  }

  const handleMaterialSubmit = async (data: MaterialFormData) => {
    setSubmitError(null);

    const payload = {
      name: data.name.trim(),
      categoryId: data.categoryId,
      consumptionType: data.consumptionType,
      active: data.active,
      sku: data.sku?.trim() || undefined,
      unit: data.unit,
      stock: Number(data.stock),
      minStock: Number(data.minStock),
      purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
      salePrice: data.salePrice ? Number(data.salePrice) : null,
      salePriceMode: data.salePriceMode,
      salePricePercent: data.salePricePercent ? Number(data.salePricePercent) : null,
      thickness: data.thickness ? Number(data.thickness) : null,
      density: data.density ? Number(data.density) : null,
      wastePercent: data.wastePercent ? Number(data.wastePercent) : 0,
      notes: data.notes?.trim() || undefined,
      finishType: data.finishType?.trim() || null,
      packagingLabel: data.packagingLabel?.trim() || null,
      packagingQty: data.packagingQty ? Number(data.packagingQty) : null,
      packagingPrice: data.packagingPrice ? Number(data.packagingPrice) : null,
      properties: Object.keys(properties).length > 0 ? properties : null,
      compatibleMethods: [],
      compatibleEquipment: [],
    };

    const response = material
      ? await updateMaterial(material.id, payload)
      : await createMaterial(payload);

    if (!response) {
      setSubmitError(lastError ?? 'Nu am putut salva materialul');
      return;
    }

    onSuccess();
  };

  const submitForm = form.handleSubmit(handleMaterialSubmit);

  return (
    <form onSubmit={submitForm} className="p-6 space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* General Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 border-b pb-2">
          General
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel>Nume material *</FormLabel>
            <Input {...form.register('name')} placeholder="ex: PVC Frontlit 510g" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <FormLabel>Categorie *</FormLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <CategoryTreeSelector
                  key={categorySelectorKey}
                  value={categoryId}
                  onChange={handleCategoryChange}
                  error={form.formState.errors.categoryId?.message}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCategoryModalOpen(true)}
                className="flex-shrink-0 h-[42px] w-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors group"
                title="Adaugă categorie nouă"
              >
                <Plus className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
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
                onClick={() => categoryId && void generateSku(categoryId)}
                disabled={!categoryId || skuLoading}
                className="flex-shrink-0 h-[42px] w-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                title="Regenerează SKU"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 group-hover:text-blue-600 ${skuLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Generat automat din categorie. Modifică manual dacă e necesar.</p>
          </div>

          <div>
            <FormLabel>Unitate de Măsură *</FormLabel>
            <select
              {...form.register('unit')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.unit.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {unit === 'm2' || unit === 'meter'
                ? 'ℹ️ Cost calculat automat pe arie în producție'
                : 'ℹ️ Cost calculat pe cantitate consumată'}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PROPRIETĂȚI MATERIAL
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 border-b pb-2">
          Proprietăți Material
        </h3>

        {/* ── Proprietăți fizice ─────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Proprietăți Fizice</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <FormLabel>Finisaj suprafață</FormLabel>
              <select
                {...form.register('finishType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">— Nespecificat —</option>
                <option value="mat">Mat</option>
                <option value="lucios">Lucios</option>
                <option value="satin">Satin</option>
                <option value="soft-touch">Soft Touch</option>
                <option value="texturiert">Texturat</option>
                <option value="transparent">Transparent</option>
                <option value="reflectorizant">Reflectorizant</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Tipul de finisaj vizibil</p>
            </div>

            <div>
              <FormLabel>Grosime (mm)</FormLabel>
              <Input
                {...form.register('thickness')}
                type="number"
                step="0.01"
                min="0"
                placeholder="ex: 0.08"
              />
              <p className="text-xs text-gray-400 mt-1">
                {unit === 'sheet' ? 'ex: carton 350g ≈ 0.4mm' : unit === 'm2' || unit === 'meter' ? 'ex: vinyl autoadeziv ≈ 0.08' : ''}
              </p>
            </div>

            <div>
              <FormLabel>Densitate (g/m²)</FormLabel>
              <Input
                {...form.register('density')}
                type="number"
                step="0.1"
                min="0"
                placeholder="ex: 80"
              />
              <p className="text-xs text-gray-400 mt-1">
                {unit === 'sheet' ? 'ex: hârtie A4 80g/m²' : unit === 'm2' || unit === 'meter' ? 'ex: banner 440g/m²' : ''}
              </p>
            </div>
          </div>

          {/* Dynamic properties based on unit */}
          <div className="border border-gray-100 rounded-xl bg-gray-50/50 px-4 py-3">
            <p className="text-xs font-medium text-gray-500 mb-3">
              Proprietăți tehnice
              {unit && <span className="ml-1 text-gray-400 font-normal">— adaptate pentru {unit}</span>}
            </p>
            <MaterialPropertiesEditor
              unit={unit ?? 'pcs'}
              value={properties}
              onChange={setProperties}
            />
          </div>
        </div>

        {/* ── Ambalaj Furnizor ───────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Ambalaj Furnizor
            <span className="normal-case font-normal ml-2 text-gray-400">(opțional — calculează automat prețul per unitate)</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FormLabel>Tip ambalaj</FormLabel>
              <select
                {...form.register('packagingLabel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Fără ambalaj</option>
                <option value="cutie">Cutie</option>
                <option value="rolă">Rolă</option>
                <option value="palet">Palet</option>
                <option value="sac">Sac</option>
                <option value="bidon">Bidon</option>
                <option value="set">Set</option>
              </select>
            </div>

            <div>
              <FormLabel>
                Cantitate per {packagingLabel || 'ambalaj'} ({unit || 'unități'})
              </FormLabel>
              <Input
                {...form.register('packagingQty')}
                type="number"
                step="0.01"
                min="0"
                placeholder={unit === 'sheet' ? '500' : unit === 'm2' ? '75' : unit === 'meter' ? '50' : '1'}
              />
            </div>

            <div>
              <FormLabel>Preț per {packagingLabel || 'ambalaj'} (MDL)</FormLabel>
              <Input
                {...form.register('packagingPrice')}
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
              />
            </div>
          </div>

          {packagingQty && packagingPrice && parseFloat(packagingQty) > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm mt-3">
              <span className="font-medium text-blue-800">Calcul automat: </span>
              <span className="text-blue-700">
                {packagingPrice} MDL ÷ {packagingQty} {unit} ={' '}
                <strong>{(parseFloat(packagingPrice) / parseFloat(packagingQty)).toFixed(4)} MDL/{unit}</strong>
              </span>
              <span className="text-blue-500 ml-2 text-xs">→ Preț achiziție per unitate setat automat</span>
            </div>
          )}
        </div>

        {/* ── Prețuri ────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Prețuri</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <FormLabel>Preț achiziție (MDL / {unit || 'unitate'})</FormLabel>
              <div className="relative">
                <Input
                  {...form.register('purchasePrice')}
                  type="number"
                  step="0.01"
                  readOnly={!!(packagingQty && packagingPrice)}
                  className={packagingQty && packagingPrice ? 'bg-gray-50 text-gray-600 cursor-default pr-14' : ''}
                />
                {packagingQty && packagingPrice && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 whitespace-nowrap">
                    auto
                  </span>
                )}
              </div>
              {packagingQty && packagingPrice && (
                <p className="text-xs text-blue-600 mt-1">
                  = {packagingPrice} ÷ {packagingQty} {unit} (din ambalaj)
                </p>
              )}
              {form.formState.errors.purchasePrice && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.purchasePrice.message}</p>
              )}
            </div>

            <div>
              <FormLabel>Mod preț vânzare</FormLabel>
              <select
                {...form.register('salePriceMode')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="amount">Sumă fixă</option>
                <option value="percent">Adaos % față de achiziție</option>
              </select>
            </div>

            {salePriceMode === 'percent' ? (
              <>
                <div>
                  <FormLabel>Adaos (%)</FormLabel>
                  <Input {...form.register('salePricePercent')} type="number" step="0.1" min="0" placeholder="20" />
                  {form.formState.errors.salePricePercent && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.salePricePercent.message}</p>
                  )}
                </div>
                <div>
                  <FormLabel>Preț vânzare calculat (MDL)</FormLabel>
                  <Input
                    {...form.register('salePrice')}
                    type="number"
                    step="0.01"
                    readOnly
                    className="bg-gray-50 text-gray-600 cursor-default"
                  />
                  {purchasePrice && salePricePercent && (
                    <p className="text-xs text-blue-600 mt-1">
                      = {purchasePrice} × (1 + {salePricePercent}%) — calculat automat
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <FormLabel>Preț vânzare (MDL / {unit || 'unitate'})</FormLabel>
                <Input {...form.register('salePrice')} type="number" step="0.01" />
                {form.formState.errors.salePrice && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.salePrice.message}</p>
                )}
              </div>
            )}

            <div>
              <FormLabel>Procent pierderi — waste (%)</FormLabel>
              <Input {...form.register('wastePercent')} type="number" step="0.1" min="0" max="100" />
              <p className="text-xs text-gray-400 mt-1">
                Risipă medie la tăiere/imprimare (implicit 3%)
              </p>
              {form.formState.errors.wastePercent && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.wastePercent.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stoc ───────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Stoc</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Stoc actual ({unit || 'unități'})</FormLabel>
              <Input {...form.register('stock')} type="number" step="0.01" min="0" />
            </div>
            <div>
              <FormLabel>Stoc minim — alertă ({unit || 'unități'})</FormLabel>
              <Input {...form.register('minStock')} type="number" step="0.01" min="0" />
              <p className="text-xs text-gray-400 mt-1">Notificare când stocul scade sub această valoare</p>
            </div>
          </div>
        </div>

        {/* ── Note ───────────────────────────────────────────────────── */}
        <div>
          <FormLabel>Note interne</FormLabel>
          <textarea
            {...form.register('notes')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Furnizor, condiții de depozitare, specificații tehnice..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Anulează
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {material ? 'Actualizează' : 'Creează'}
        </Button>
      </div>

      {/* Quick Category Modal */}
      {isQuickCategoryModalOpen && (
        <CategoryModal
          category={null}
          parentId={null}
          onClose={handleQuickCategorySuccess}
        />
      )}
    </form>
  );
}
