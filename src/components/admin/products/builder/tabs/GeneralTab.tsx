import { Plus, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { PRODUCT_TYPES } from '@/modules/products/types';
import type { Category } from '@/modules/products/types';
import type { CreateFullProductInput } from '@/modules/products/productBuilder.types';

type FieldChangeHandler = (
  field: keyof CreateFullProductInput,
  value: CreateFullProductInput[keyof CreateFullProductInput]
) => void;

interface GeneralTabProps {
  data: CreateFullProductInput;
  categories: Category[];
  onNameChange: (value: string) => void;
  onFieldChange: FieldChangeHandler;
  onSlugChange: (value: string, lock?: boolean) => void;
  onImagesChange: (images: string[]) => void;
}

export function GeneralTab({
  data,
  categories,
  onNameChange,
  onFieldChange,
  onSlugChange,
  onImagesChange,
}: GeneralTabProps) {
  const images = data.images && data.images.length > 0 ? data.images : [''];

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
                Generează
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">URL final: /produse/{data.slug || 'slug'}</p>
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
              <option value="">Selectează categoria</option>
              {categories
                .filter((cat) => !cat.parentId) // Doar categorii principale
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((parentCategory) => {
                  const subcategories = categories
                    .filter((cat) => cat.parentId === parentCategory.id)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                  
                  return (
                    <optgroup key={parentCategory.id} label={`${parentCategory.icon || ''} ${parentCategory.name}`}>
                      {/* Opțiune pentru categoria principală */}
                      <option value={parentCategory.id}>
                        {parentCategory.name} (categoria principală)
                      </option>
                      {/* Subcategorii indentate */}
                      {subcategories.map((subcat) => (
                        <option key={subcat.id} value={subcat.id}>
                          └─ {subcat.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Poți selecta atât categoria principală cât și subcategoriile
            </p>
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
                {productType.value === 'STANDARD' && 'Preț fix și detalii de bază'}
                {productType.value === 'CONFIGURABLE' && 'Configurator cu multiple opțiuni'}
                {productType.value === 'CUSTOM' && 'Detalii complet personalizate'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Descriere scurtă</label>
          <textarea
            rows={3}
            value={data.descriptionShort}
            onChange={(event) => onFieldChange('descriptionShort', event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Mesaj scurt pentru listări și carduri"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Descriere detaliată</label>
          <textarea
            rows={6}
            value={data.description}
            onChange={(event) => onFieldChange('description', event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Include materiale, tehnici și beneficii"
          />
        </div>
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
          <p className="text-sm text-gray-600">Produsul va fi vizibil în magazin și configurator</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Galerie imagini</p>
            <p className="text-xs text-gray-500">Folosește URL-uri publice sau încărcate în CDN</p>
          </div>
          <button
            type="button"
            onClick={handleImageAdd}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            <Plus className="h-4 w-4" /> Adaugă imagine
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
