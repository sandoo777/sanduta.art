import { Plus, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { PRODUCT_TYPES } from '@/modules/products/types';
import type { Category } from '@/modules/products/types';
import type { Material } from '@/modules/materials/types';
import type { PrintMethod } from '@/modules/print-methods/types';
import type { Machine } from '@/modules/machines/types';
import type { CreateFullProductInput } from '@/modules/products/productBuilder.types';

type FieldChangeHandler = (
  field: keyof CreateFullProductInput,
  value: CreateFullProductInput[keyof CreateFullProductInput]
) => void;

interface GeneralTabProps {
  data: CreateFullProductInput;
  categories: Category[];
  materials: Material[];
  printMethods: PrintMethod[];
  machines: Machine[];
  onNameChange: (value: string) => void;
  onFieldChange: FieldChangeHandler;
  onSlugChange: (value: string, lock?: boolean) => void;
  onImagesChange: (images: string[]) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function GeneralTab({
  data,
  categories,
  materials,
  printMethods,
  machines,
  onNameChange,
  onFieldChange,
  onSlugChange,
  onImagesChange,
}: GeneralTabProps) {
  const images = data.images && data.images.length > 0 ? data.images : [''];
  const selectedMethod = printMethods.find((method) => method.id === data.printMethodId);
  const isOutsourcedMethod = Boolean(selectedMethod?.isOutsourced);
  const compatibleMaterialIds = selectedMethod?.materialIds ?? [];
  const filteredMaterials =
    selectedMethod && compatibleMaterialIds.length > 0
      ? materials.filter((material) => compatibleMaterialIds.includes(material.id))
      : materials;

  const compatibleEquipment = selectedMethod
    ? machines.filter((machine) => machine.compatiblePrintMethodIds.includes(selectedMethod.id))
    : [];

  const supplierCostPerUnit = Number(selectedMethod?.costFurnizorPerUnit ?? 0);
  const supplierCostPerM2 = Number(selectedMethod?.costFurnizorPerM2 ?? 0);
  const defaultSupplierCost = data.saleUnit === 'M2' ? supplierCostPerM2 : supplierCostPerUnit;
  const supplierCostBase = Number(data.supplierCost ?? defaultSupplierCost);
  const markupPercent = Number(data.markup ?? selectedMethod?.markup ?? 0);
  const markupValue = supplierCostBase * (markupPercent / 100);
  const outsourceFinalPrice = supplierCostBase + markupValue;

  const handleImageChange = (index: number, value: string) => {
    const next = [...images];
    next[index] = value;
    onImagesChange(next);
  };

  const handleImageRemove = (index: number) => {
    const next = images.filter((_, idx) => idx !== index);
    onImagesChange(next.length > 0 ? next : ['']);
  };

  const handleImageAdd = () => {
    onImagesChange([...images, '']);
  };

  const handleSlugBlur = () => {
    const normalized = data.slug.trim();
    if (normalized !== data.slug) {
      onSlugChange(normalized, true);
    }
  };

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('active', event.target.checked);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
              Nume produs <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(event) => onNameChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Flyere A5 Premium"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
              Slug / URL <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={data.slug}
                onChange={(event) => onSlugChange(event.target.value, true)}
                onBlur={handleSlugBlur}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="flyere-a5-premium"
              />
              <button
                type="button"
                onClick={() => onSlugChange(data.name, false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Genereaza
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">URL final: /produse/{data.slug || 'slug'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Descriere</label>
            <textarea
              rows={6}
              value={data.description}
              onChange={(event) => onFieldChange('description', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Descriere produs pentru operatori si magazin"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
              SKU (cod intern)
            </label>
            <input
              type="text"
              value={data.sku}
              onChange={(event) => onFieldChange('sku', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="FLY-A5-001"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
              Categorie <span className="text-red-500">*</span>
            </label>
            <select
              value={data.categoryId}
              onChange={(event) => onFieldChange('categoryId', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecteaza categoria</option>
              {categories
                .filter((cat) => !cat.parentId)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((parentCategory) => {
                  const subcategories = categories
                    .filter((cat) => cat.parentId === parentCategory.id)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));

                  return (
                    <optgroup key={parentCategory.id} label={`${parentCategory.icon || ''} ${parentCategory.name}`}>
                      <option value={parentCategory.id}>{parentCategory.name} (categoria principala)</option>
                      {subcategories.map((subcat) => (
                        <option key={subcat.id} value={subcat.id}>
                          └─ {subcat.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
            </select>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <input
              type="checkbox"
              checked={data.active}
              onChange={handleCheckbox}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Produs activ</p>
              <p className="text-sm text-gray-600">Produsul va fi vizibil in magazin si configurator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Tipul produsului</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRODUCT_TYPES.map((productType) => (
            <button
              key={productType.value}
              type="button"
              onClick={() => onFieldChange('type', productType.value)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                data.type === productType.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{productType.label}</p>
              <p className="text-sm text-gray-500">
                {productType.value === 'STANDARD' && 'Pret fix si detalii de baza'}
                {productType.value === 'CONFIGURABLE' && 'Configurator cu multiple optiuni'}
                {productType.value === 'CUSTOM' && 'Detalii complet personalizate'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Sectiunea B - Metoda de Printare</h3>
        <div>
          <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
            Metoda de printare <span className="text-red-500">*</span>
          </label>
          <select
            value={data.printMethodId ?? ''}
            onChange={(event) => onFieldChange('printMethodId', event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecteaza metoda</option>
            {printMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name} {method.isOutsourced ? '(Outsource)' : '(Intern)'}
              </option>
            ))}
          </select>
        </div>

        {selectedMethod && !isOutsourcedMethod && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Materiale compatibile</p>
              <p className="text-sm text-emerald-800">
                {filteredMaterials.length > 0
                  ? `${filteredMaterials.length} materiale compatibile cu metoda selectata`
                  : 'Nu exista materiale compatibile active'}
              </p>
            </div>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Echipamente compatibile</p>
              <p className="text-sm text-indigo-800">
                {compatibleEquipment.length > 0
                  ? compatibleEquipment.map((machine) => machine.name).join(', ')
                  : 'Nu exista echipamente mapate pentru aceasta metoda'}
              </p>
            </div>
          </div>
        )}

        {selectedMethod && isOutsourcedMethod && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
            <p className="text-xs font-semibold text-amber-700 uppercase">Metoda outsource</p>
            <p className="text-sm text-amber-900">Furnizor: {selectedMethod.name}</p>
            {selectedMethod.termenFurnizor && (
              <p className="text-xs text-amber-700">Termen furnizor: {selectedMethod.termenFurnizor}</p>
            )}
            <p className="text-xs text-amber-700">
              Cost furnizor (default metodă): {data.saleUnit === 'M2' ? formatCurrency(supplierCostPerM2) + ' / m²' : formatCurrency(supplierCostPerUnit) + ' / buc'}
            </p>
            <p className="text-xs text-amber-700">Markup (default metodă): {Number(selectedMethod?.markup ?? 0).toFixed(2)}%</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-violet-900 uppercase tracking-wide">Sectiunea C - Preturi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
              Unitate de vanzare <span className="text-red-500">*</span>
            </label>
            <select
              value={data.saleUnit}
              onChange={(event) => onFieldChange('saleUnit', event.target.value as CreateFullProductInput['saleUnit'])}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="UNIT">Bucata</option>
              <option value="M2">m²</option>
            </select>
          </div>

          {!isOutsourcedMethod && (data.saleUnit === 'M2' ? (
            <div>
              <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
                pricePerM2 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.pricePerM2 ?? 0}
                onChange={(event) => onFieldChange('pricePerM2', Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
                pricePerUnit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.pricePerUnit ?? 0}
                onChange={(event) => onFieldChange('pricePerUnit', Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {isOutsourcedMethod && selectedMethod && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
                  supplierCost <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.supplierCost ?? supplierCostBase}
                  onChange={(event) => onFieldChange('supplierCost', Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">{data.saleUnit === 'M2' ? 'per m²' : 'per buc'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
                  markup% <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.markup ?? markupPercent}
                  onChange={(event) => onFieldChange('markup', Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Cantitate minima comanda</label>
            <input
              type="number"
              min="1"
              value={data.minOrderQty ?? 1}
              onChange={(event) => onFieldChange('minOrderQty', Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isOutsourcedMethod && selectedMethod && (
          <div className="rounded-lg border border-amber-200 bg-white p-3">
            <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Pret final calculat automat (outsource)</p>
            <p className="text-sm text-gray-900">
              Cost furnizor {formatCurrency(supplierCostBase)} + markup {formatCurrency(markupValue)} ={' '}
              <span className="font-semibold">{formatCurrency(outsourceFinalPrice)}</span>
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Sectiunea D - Material implicit</h3>
        <div>
          <label className="text-sm font-medium text-gray-700 inline-flex items-center gap-2">
            Material implicit {!isOutsourcedMethod && <span className="text-red-500">*</span>}
          </label>
          <select
            value={data.materialId ?? ''}
            onChange={(event) => onFieldChange('materialId', event.target.value)}
            disabled={isOutsourcedMethod}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">{isOutsourcedMethod ? 'Nu se aplica pentru outsource' : 'Selecteaza material'}</option>
            {filteredMaterials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name} ({material.unit})
              </option>
            ))}
          </select>
          {!isOutsourcedMethod && selectedMethod && compatibleMaterialIds.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">Materialele sunt filtrate dupa compatibilitatea metodei selectate.</p>
          )}
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Galerie imagini</p>
            <p className="text-xs text-gray-500">Foloseste URL-uri publice sau incarcate in CDN</p>
          </div>
          <button
            type="button"
            onClick={handleImageAdd}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            <Plus className="h-4 w-4" /> Adauga imagine
          </button>
        </div>
        <div className="space-y-3">
          {images.map((url, index) => (
            <div key={`image-${index}`} className="flex items-center gap-3">
              <input
                type="text"
                value={url}
                onChange={(event) => handleImageChange(index, event.target.value)}
                placeholder="https://cdn.sanduta.art/produse/flyer-cover.jpg"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleImageRemove(index)}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
