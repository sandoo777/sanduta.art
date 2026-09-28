'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { materialFormSchema, type MaterialFormData } from '@/lib/validations/admin';
import { useMaterials } from '@/modules/materials/useMaterials';
import type { Material } from '@/modules/materials/types';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';
import { hasMaterialPropForUnit, sanitizeMaterialPayloadByUnit } from '@/config/materialPropsByUnit';
import {
  GeneralSection,
  ImagesSection,
  NotesSection,
  PricingSection,
  PropertiesSection,
  StockSection,
  SuppliersSection,
} from '@/components/material';
import type { FormatCategoryOption, FormatOption, SupplierLinkState, SupplierOption } from '@/components/material';
import CategoryModal from './CategoryModal';
import { buildMaterialPriceBreaksPayload } from './buildMaterialPayload';

interface MaterialFormProps {
  material?: Material;
  forceCreate?: boolean;
  onClose: () => void;
  onSuccess: (material?: Material | null) => void | Promise<void>;
}

function toFormPriceBreaks(material: Material | undefined) {
  return material?.priceBreaks?.map((row) => ({
    qtyMin: row.qtyMin.toString(),
    // null/undefined qtyMax means the tier is open-ended (unlimited) — keep the field empty.
    qtyMax: row.qtyMax === null || row.qtyMax === undefined ? '' : row.qtyMax.toString(),
    price: row.price.toString(),
    discount: row.discount?.toString() ?? '',
  })) ?? [];
}

function toMaterialFormDefaults(material: Material | undefined): MaterialFormData {
  const minimumMarginFromProperties = material?.properties
    && typeof material.properties === 'object'
    && 'minimumMarginPercent' in material.properties
    ? Number((material.properties as Record<string, unknown>).minimumMarginPercent)
    : null;

  const existingMinimumMargin = material && typeof material === 'object' && 'minimumMarginPercent' in material
    ? Number((material as { minimumMarginPercent?: number | null }).minimumMarginPercent ?? minimumMarginFromProperties ?? 15)
    : 15;

  const legacyTexture = typeof material?.properties === 'object' && material.properties
    ? ((material.properties as Record<string, unknown>).texture ?? '')
    : '';

  return {
    name: material?.name ?? '',
    categoryId: material?.categoryId ?? '',
    colorName: material?.colorName ?? '',
    colorCode: material?.colorCode ?? '',
    thumbnailImage: material?.thumbnailUrl ?? '',
    macroTextureImage: material?.macroTextureUrl ?? '',
    texture: legacyTexture,
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
    minimumMarginPercent: String(Number.isFinite(existingMinimumMargin) ? existingMinimumMargin : 15),
    thickness: material?.thickness?.toString() ?? '',
    density: material?.density?.toString() ?? '',
    formatId: material?.formatId ?? '',
    formatName: material?.formatName ?? '',
    width_mm: material?.width_mm?.toString() ?? '',
    height_mm: material?.height_mm?.toString() ?? '',
    notes: material?.notes ?? '',
    compatibleEquipment: [],
    priceBreaks: toFormPriceBreaks(material),
    packagingLabel: material?.packagingLabel ?? '',
    packagingQty: material?.packagingQty?.toString() ?? '',
    packagingPrice: material?.packagingPrice?.toString() ?? '',
    finishType: material?.finishType ?? '',
  };
}

export function MaterialForm({ material, forceCreate = false, onClose, onSuccess }: MaterialFormProps) {
  const DENORMALIZE_COALA_FROM_FORMAT = false;
  const { createMaterial, updateMaterial, isLoading, lastError } = useMaterials();
  const [activeTab, setActiveTab] = useState('general');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);
  const [categorySelectorKey, setCategorySelectorKey] = useState(0); // For forcing re-fetch
  const [formats, setFormats] = useState<FormatOption[]>([]);
  const [formatCategory, setFormatCategory] = useState('');
  const [formatCategoryOptions, setFormatCategoryOptions] = useState<FormatCategoryOption[]>([]);
  const initializedFormatCategoryForMaterialId = useRef<string | null>(null);
  const [formatNameDirty, setFormatNameDirty] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [primarySupplierId, setPrimarySupplierId] = useState<string | null>(material?.primarySupplierId ?? null);
  const [supplierLinks, setSupplierLinks] = useState<SupplierLinkState[]>(
    material?.suppliers && material.suppliers.length > 0
      ? material.suppliers.map((link) => ({
          supplierId: link.supplierId,
        }))
      : [{ supplierId: '' }]
  );
  const selectedMethodIds =
    material?.printMethodIds ?? material?.compatibleMethods ?? material?.printMethods?.map((method) => method.id) ?? [];

  const form = useForm({
    resolver: zodResolver(materialFormSchema) as never,
    defaultValues: toMaterialFormDefaults(material),
  }) as unknown as UseFormReturn<MaterialFormData>;

  const categoryId = useWatch({ control: form.control, name: 'categoryId' });
  const unit = useWatch({ control: form.control, name: 'unit' });
  const stockValue = useWatch({ control: form.control, name: 'stock' });
  const minStockValue = useWatch({ control: form.control, name: 'minStock' });
  const formatId = useWatch({ control: form.control, name: 'formatId' });
  const formatName = useWatch({ control: form.control, name: 'formatName' });
  const width_mm = useWatch({ control: form.control, name: 'width_mm' });
  const height_mm = useWatch({ control: form.control, name: 'height_mm' });
  const [skuLoading, setSkuLoading] = useState(false);
  const isCoalaMaterial = unit === 'sheet';
  const showFormatFields = hasMaterialPropForUnit(unit, 'formatId');
  const showRoleFormatFields = unit === 'meter' && Boolean(formatCategory);
  const showFormatSelector = showFormatFields || showRoleFormatFields;
  const showWidthField = hasMaterialPropForUnit(unit, 'width_mm') && !isCoalaMaterial;
  const showHeightField = hasMaterialPropForUnit(unit, 'height_mm') && !isCoalaMaterial;
  const showThicknessField = hasMaterialPropForUnit(unit, 'thickness');
  const showDensityField = hasMaterialPropForUnit(unit, 'density');

  useEffect(() => {
    form.reset(toMaterialFormDefaults(material));
    setPrimarySupplierId(material?.primarySupplierId ?? null);
    setSupplierLinks(
      material?.suppliers && material.suppliers.length > 0
        ? material.suppliers.map((link) => ({
            supplierId: link.supplierId,
          }))
        : [{ supplierId: '' }]
    );
    setFormatNameDirty(false);
    initializedFormatCategoryForMaterialId.current = null;
  }, [material, form]);

  useEffect(() => {
    if (!material?.id) {
      setFormatCategory('');
      initializedFormatCategoryForMaterialId.current = null;
      return;
    }

    if (initializedFormatCategoryForMaterialId.current === material.id) {
      return;
    }

    if (!material.formatId) {
      setFormatCategory('');
      initializedFormatCategoryForMaterialId.current = material.id;
      return;
    }

    const selectedFormat = formats.find((format) => format.id === material.formatId);
    if (!selectedFormat) {
      return;
    }

    setFormatCategory(selectedFormat.category ?? '');
    initializedFormatCategoryForMaterialId.current = material.id;
  }, [formats, material?.formatId, material?.id]);

  const filteredFormats = formats.filter((format) => {
    return !formatCategory || format.category === formatCategory;
  });

  useEffect(() => {
    const params = formatCategory ? `?category=${encodeURIComponent(formatCategory)}` : '';
    fetch(`/api/admin/formats${params}`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          setFormats(data.map((format) => ({
            ...format,
            category: 'category' in format && typeof format.category === 'string' ? format.category : null,
            height_mm: 'height_mm' in format ? (format as { height_mm?: number | null }).height_mm ?? null : null,
          })));
        }
      })
      .catch(() => setFormats([]));
  }, [formatCategory]);

  useEffect(() => {
    fetch('/api/admin/formats_categories', { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!Array.isArray(data)) {
          setFormatCategoryOptions([]);
          return;
        }

        const options = data
          .filter((item) => item && typeof item === 'object')
          .map((item) => {
            const raw = item as Record<string, unknown>;
            return {
              id: typeof raw.id === 'string' ? raw.id : String(raw.code ?? ''),
              code: typeof raw.code === 'string' ? raw.code : '',
              name: typeof raw.name === 'string' ? raw.name : String(raw.code ?? ''),
              enabled: raw.enabled === false ? false : true,
            } satisfies FormatCategoryOption;
          })
          .filter((item) => item.id && item.code && item.enabled !== false);

        setFormatCategoryOptions(options);
      })
      .catch(() => setFormatCategoryOptions([]));
  }, []);

  useEffect(() => {
    fetch('/api/admin/suppliers', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load suppliers');
        }
        const payload = await response.json().catch(() => null);
        const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        setSuppliers(items as SupplierOption[]);
      })
      .catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    setPrimarySupplierId(material?.primarySupplierId ?? null);
    setSupplierLinks(
      material?.suppliers && material.suppliers.length > 0
        ? material.suppliers.map((link) => ({
            supplierId: link.supplierId,
          }))
        : [{ supplierId: '' }]
    );
  }, [material]);

  useEffect(() => {
    if (formatId && filteredFormats.length > 0 && !filteredFormats.some((format) => format.id === formatId)) {
      form.setValue('formatId', '');
      form.setValue('formatName', '');
      form.setValue('width_mm', '');
      form.setValue('height_mm', '');
    }
  }, [formatId, filteredFormats, form]);

  useEffect(() => {
    const selected = formats.find((format) => format.id === formatId);
    if (!selected) return;

    const nextWidth = String(selected.width_mm);
    const nextHeight = selected.height_mm == null ? '' : String(selected.height_mm);

    if (!formatNameDirty || !formatName?.trim()) {
      form.setValue('width_mm', nextWidth);
      form.setValue('height_mm', nextHeight);
      if (!formatNameDirty) {
        form.setValue('formatName', selected.name);
      }
    }
  }, [formats, formatId, form, formatName, formatNameDirty]);

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

  function handleCategoryChange(categoryId: string, category: MaterialCategoryTree | null) {
    const previousCategoryId = form.getValues('categoryId');
    const categoryChanged = previousCategoryId !== categoryId;
    form.setValue('categoryId', categoryId);
    
    // Clear fields that are not required by the new category
    if (category && categoryChanged) {
      if (!category.requiresThickness) form.setValue('thickness', '');
      if (!category.requiresDensity) form.setValue('density', '');
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

    const hasPurchasePrice = data.purchasePrice !== undefined && data.purchasePrice !== '';
    const hasSalePrice = data.salePrice !== undefined && data.salePrice !== '';

    if (!material && !hasPurchasePrice && !hasSalePrice) {
      setActiveTab('pricing');
      setSubmitError('Completeaza cel putin un pret (achizitie sau vanzare) pentru materialele noi.');
      form.setError('salePrice', {
        type: 'manual',
        message: 'Completeaza cel putin un pret (achizitie sau vanzare).',
      });
      return;
    }

    if (!material && !data.thumbnailImage?.trim()) {
      setActiveTab('images');
      setSubmitError('Thumbnail-ul este obligatoriu pentru materialele noi.');
      form.setError('thumbnailImage', {
        type: 'manual',
        message: 'Incarca thumbnail-ul materialului.',
      });
      return;
    }

    const sanitizedProperties = data.texture ? { texture: data.texture.trim() } : null;

    const dedupedSupplierLinks = new Map<string, { supplierId: string }>();
    supplierLinks
      .filter((link) => link.supplierId)
      .forEach((link) => {
        const supplierId = link.supplierId;
        dedupedSupplierLinks.set(supplierId, {
          supplierId,
        });
      });

    if (primarySupplierId && !dedupedSupplierLinks.has(primarySupplierId)) {
      dedupedSupplierLinks.set(primarySupplierId, {
        supplierId: primarySupplierId,
      });
    }

    const suppliersPayload = Array.from(dedupedSupplierLinks.values()).map((link) => ({ supplierId: link.supplierId }));

    const selectedFormatForPayload = data.formatId
      ? formats.find((format) => format.id === data.formatId)
      : null;

    const coalaDenormalizedPayload = isCoalaMaterial && DENORMALIZE_COALA_FROM_FORMAT
      ? {
          width_mm: selectedFormatForPayload?.width_mm ?? null,
          height_mm: selectedFormatForPayload?.height_mm ?? null,
        }
      : {};

    const rawPayload = {
      name: data.name.trim(),
      categoryId: data.categoryId,
      colorName: data.colorName?.trim() || null,
      colorCode: data.colorCode?.trim() || null,
      thumbnailUrl: data.thumbnailImage?.trim() || null,
      macroTextureUrl: data.macroTextureImage?.trim() || null,
      texture: data.texture?.trim() || null,
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
      minimumMarginPercent: data.minimumMarginPercent ? Number(data.minimumMarginPercent) : 15,
      formatId: data.formatId?.trim() || null,
      formatName: data.formatName?.trim() || null,
      ...(!isCoalaMaterial
        ? {
            width_mm: data.width_mm ? Number(data.width_mm) : null,
            height_mm: data.height_mm ? Number(data.height_mm) : null,
          }
        : coalaDenormalizedPayload),
      thickness: data.thickness ? Number(data.thickness) : null,
      density: data.density ? Number(data.density) : null,
      notes: data.notes?.trim() || undefined,
      finishType: data.finishType?.trim() || null,
      packagingLabel: data.packagingLabel?.trim() || null,
      packagingQty: data.packagingQty ? Number(data.packagingQty) : null,
      packagingPrice: data.packagingPrice ? Number(data.packagingPrice) : null,
      formatCategoryId: formatCategory || null,
      properties: sanitizedProperties,
      primarySupplierId: primarySupplierId || null,
      suppliers: suppliersPayload,
      printMethodIds: selectedMethodIds,
      compatibleEquipment: [],
    };

    if (data.unit === 'sheet') {
      delete (rawPayload as Record<string, unknown>).width_mm;
      delete (rawPayload as Record<string, unknown>).height_mm;
      delete (rawPayload as Record<string, unknown>).gramaj_g;
      delete (rawPayload as Record<string, unknown>).sheets_per_box;
    }

    const { sanitized: payload } = sanitizeMaterialPayloadByUnit(rawPayload, data.unit);

    const normalizedPriceBreaks = buildMaterialPriceBreaksPayload(data);
    payload.priceBreaks = normalizedPriceBreaks;

    const response = !forceCreate && material?.id ? await updateMaterial(material.id, payload) : await createMaterial(payload);

    if (!response) {
      setSubmitError(lastError ?? 'Nu am putut salva materialul');
      return;
    }

    await onSuccess(response);
  };

  const handleInvalidSubmit = (errors: FieldErrors<MaterialFormData>) => {
    const firstField = Object.keys(errors)[0] as keyof MaterialFormData | undefined;
    if (firstField) {
      const message = errors[firstField]?.message;
      setSubmitError(typeof message === 'string' ? message : 'Formularul contine erori. Verifica campurile marcate.');

      if (firstField === 'thumbnailImage' || firstField === 'macroTextureImage') {
        setActiveTab('images');
      } else if (firstField === 'finishType' || firstField === 'colorName' || firstField === 'texture' || firstField === 'thickness' || firstField === 'density') {
        setActiveTab('properties');
      } else if (firstField === 'purchasePrice' || firstField === 'salePrice' || firstField === 'salePricePercent' || firstField === 'minimumMarginPercent' || firstField === 'priceBreaks') {
        setActiveTab('pricing');
      } else if (firstField === 'notes') {
        setActiveTab('notes');
      } else {
        setActiveTab('general');
      }
      return;
    }

    setSubmitError('Formularul contine erori. Verifica campurile marcate.');
  };

  const submitForm = form.handleSubmit(handleMaterialSubmit, handleInvalidSubmit);

  return (
    <FormProvider {...form}>
      <form onSubmit={submitForm} className="space-y-6 p-6">
        {submitError && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {submitError}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 md:grid-cols-6">
            <TabsTrigger value="general" className="rounded-lg px-3 py-2 text-sm font-medium">General</TabsTrigger>
            <TabsTrigger value="images" className="rounded-lg px-3 py-2 text-sm font-medium">Images</TabsTrigger>
            <TabsTrigger value="properties" className="rounded-lg px-3 py-2 text-sm font-medium">Proprietăți</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-lg px-3 py-2 text-sm font-medium">Prețuri</TabsTrigger>
            <TabsTrigger value="suppliers" className="rounded-lg px-3 py-2 text-sm font-medium">Stoc & Furnizori</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-lg px-3 py-2 text-sm font-medium">Note</TabsTrigger>
          </TabsList>

          <TabsContent value="general" activeValue={activeTab} className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <GeneralSection
              categoryId={categoryId}
              categorySelectorKey={categorySelectorKey}
              onCategoryChange={handleCategoryChange}
              onOpenQuickCategory={() => setIsQuickCategoryModalOpen(true)}
              skuLoading={skuLoading}
              onGenerateSku={() => categoryId && void generateSku(categoryId)}
              unit={unit}
              formatCategory={formatCategory}
              formatCategoryOptions={formatCategoryOptions}
              onFormatCategoryChange={setFormatCategory}
              showFormatSelector={showFormatSelector}
              showWidthField={showWidthField}
              showHeightField={showHeightField}
              filteredFormats={filteredFormats}
              formats={formats}
              formatId={formatId ?? ''}
              formatName={formatName ?? ''}
              width_mm={width_mm ?? ''}
              height_mm={height_mm ?? ''}
              onFormatNameDirty={() => setFormatNameDirty(true)}
            />
          </TabsContent>

          <TabsContent value="images" activeValue={activeTab} className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <ImagesSection isNewMaterial={!material} />
          </TabsContent>

          <TabsContent value="properties" activeValue={activeTab} className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <PropertiesSection
              unit={unit}
              showThicknessField={showThicknessField}
              showDensityField={showDensityField}
            />
          </TabsContent>

          <TabsContent value="pricing" activeValue={activeTab} className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <PricingSection
              unit={unit}
            />
          </TabsContent>

          <TabsContent value="suppliers" activeValue={activeTab} className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <div className="space-y-6">
              <StockSection
                unit={unit}
                stock={stockValue ?? ''}
                minStock={minStockValue ?? ''}
              />

              <div className="border-t border-gray-200 pt-6">
                <SuppliersSection
                  suppliers={suppliers}
                  primarySupplierId={primarySupplierId}
                  onPrimarySupplierChange={setPrimarySupplierId}
                  supplierLinks={supplierLinks}
                  onSupplierLinksChange={setSupplierLinks}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" activeValue={activeTab} className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <NotesSection />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Anulează
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {material ? 'Actualizează' : 'Creează'}
          </Button>
        </div>

        {isQuickCategoryModalOpen && (
          <CategoryModal
            category={null}
            parentId={null}
            onClose={handleQuickCategorySuccess}
          />
        )}
      </form>
    </FormProvider>
  );
}
