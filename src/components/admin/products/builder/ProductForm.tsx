'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useProductBuilder } from '@/modules/products/useProductBuilder';
import type { Category } from '@/modules/products/types';
import type { Material } from '@/modules/materials/types';
import type { PrintMethod } from '@/modules/print-methods/types';
import type { FinishingOperation } from '@/modules/finishing/types';
import type { Machine } from '@/modules/machines/types';
import type {
  CreateFullProductInput,
  FullProduct,
  ProductPricing,
  ProductDimensions,
  ProductOption,
  ProductProduction,
  ProductSEO,
} from '@/modules/products/productBuilder.types';
import { GeneralTab } from './tabs/GeneralTab';
import { OptionsTab } from './tabs/OptionsTab';
import { PricingTab } from './tabs/PricingTab';
import { ProductionTab } from './tabs/ProductionTab';
import { SeoTab } from './tabs/SeoTab';
import { PreviewTab } from './tabs/PreviewTab';

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
}

interface BuilderResources {
  categories: Category[];
  materials: Material[];
  printMethods: PrintMethod[];
  finishing: FinishingOperation[];
  machines: Machine[];
}

const DEFAULT_PRODUCT_DATA: CreateFullProductInput = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  descriptionShort: '',
  type: 'STANDARD',
  categoryId: '',
  active: true,
  options: [],
  dimensions: { unit: 'mm' },
  compatibleMaterials: [],
  compatiblePrintMethods: [],
  compatibleFinishing: [],
  pricing: {
    type: 'fixed',
    basePrice: 0,
    priceBreaks: [],
  },
  production: {
    operations: [],
    estimatedTime: 0,
    notes: '',
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
  },
  images: [],
};

const TABS = [
  { id: 'general', label: 'General', description: 'Detalii de bază, imagini, status' },
  { id: 'options', label: 'Opțiuni', description: 'Dimensiuni, materiale și configurator' },
  { id: 'pricing', label: 'Pricing', description: 'Prețuri, discount-uri și formule' },
  { id: 'production', label: 'Producție', description: 'Operațiuni, utilaje, timp estimat' },
  { id: 'seo', label: 'SEO', description: 'Meta title, descriere și OG' },
  { id: 'preview', label: 'Preview', description: 'Rezumat și simulare de preț' },
] as const;

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapProductToForm(product: FullProduct): CreateFullProductInput {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? '',
    description: product.description ?? '',
    descriptionShort: product.descriptionShort ?? '',
    type: product.type,
    categoryId: product.categoryId,
    active: product.active,
    options: product.options ?? [],
    dimensions: product.dimensions ?? { unit: 'mm' },
    compatibleMaterials: product.compatibleMaterials ?? [],
    compatiblePrintMethods: product.compatiblePrintMethods ?? [],
    compatibleFinishing: product.compatibleFinishing ?? [],
    pricing: product.pricing ?? {
      type: 'fixed',
      basePrice: Number(product.price ?? 0),
      priceBreaks: [],
    },
    production: product.production ?? {
      operations: [],
      estimatedTime: 0,
      notes: '',
    },
    seo: product.seo ?? {
      metaTitle: product.metaTitle ?? '',
      metaDescription: product.metaDescription ?? '',
      ogImage: product.ogImage ?? '',
    },
    images: product.images?.map((image) => image.url) ?? [],
  };
}

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const {
    loading,
    saving,
    fetchFullProduct,
    createFullProduct,
    updateFullProduct,
    validateProduct,
    calculatePreviewPrice,
  } = useProductBuilder();

  const [resources, setResources] = useState<BuilderResources>({
    categories: [],
    materials: [],
    printMethods: [],
    finishing: [],
    machines: [],
  });
  const [formData, setFormData] = useState<CreateFullProductInput>(DEFAULT_PRODUCT_DATA);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('general');
  const [errors, setErrors] = useState<string[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [slugLocked, setSlugLocked] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingResources(true);
        const [categoriesRes, materialsRes, printMethodsRes, finishingRes, machinesRes] = await Promise.all([
          fetch('/api/admin/categories', { credentials: 'include' }),
          fetch('/api/admin/materials', { credentials: 'include' }),
          fetch('/api/admin/print-methods', { credentials: 'include' }),
          fetch('/api/admin/finishing', { credentials: 'include' }),
          fetch('/api/admin/machines', { credentials: 'include' }),
        ]);

        const [categories, materials, printMethods, finishing, machines] = await Promise.all([
          categoriesRes.json(),
          materialsRes.json(),
          printMethodsRes.json(),
          finishingRes.json(),
          machinesRes.json(),
        ]);

        setResources({ categories, materials, printMethods, finishing, machines });
      } catch (error) {
        console.error('Error loading builder resources:', error);
        toast.error('Nu am putut încărca resursele necesare pentru builder');
      } finally {
        setLoadingResources(false);
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && productId) {
      const loadProduct = async () => {
        try {
          setInitialLoading(true);
          const product = await fetchFullProduct(productId);
          setFormData(mapProductToForm(product));
          setSlugLocked(true);
        } catch (error) {
          console.error('Error loading product:', error);
        } finally {
          setInitialLoading(false);
        }
      };

      loadProduct();
    }
  }, [mode, productId, fetchFullProduct]);

  useEffect(() => {
    if (activeTab === 'options' && formData.type !== 'CONFIGURABLE') {
      setActiveTab('general');
    }
  }, [activeTab, formData.type]);

  const visibleTabs = useMemo(() => {
    return TABS.filter((tab) => tab.id !== 'options' || formData.type === 'CONFIGURABLE');
  }, [formData.type]);

  const updateField = <K extends keyof CreateFullProductInput>(field: K, value: CreateFullProductInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: slugLocked ? prev.slug : generateSlug(value),
    }));
  };

  const handleSlugChange = (value: string, lock: boolean = true) => {
    const nextSlug = lock ? value : generateSlug(value);
    setSlugLocked(lock);
    setFormData((prev) => ({
      ...prev,
      slug: nextSlug,
    }));
  };

  const handleImagesChange = (images: string[]) => {
    updateField('images', images);
  };

  const handlePricingChange = (pricing: ProductPricing) => {
    updateField('pricing', pricing);
  };

  const handleDimensionsChange = (dimensions?: ProductDimensions) => {
    updateField('dimensions', dimensions);
  };

  const handleOptionsChange = (options: ProductOption[]) => {
    updateField('options', options);
  };

  const handleProductionChange = (production?: ProductProduction) => {
    updateField('production', production);
  };

  const handleSeoChange = (seo?: ProductSEO) => {
    updateField('seo', seo);
  };

  const handleSubmit = async () => {
    const validationErrors = validateProduct(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error('Verifică câmpurile marcate înainte de salvare');
      return;
    }

    try {
      setErrors([]);
      const normalizedSlug = generateSlug(formData.slug) || formData.slug;
      const payload: CreateFullProductInput = {
        ...formData,
        slug: normalizedSlug,
        sku: formData.sku?.trim() || undefined,
        images: formData.images?.map((url) => url.trim()).filter((url) => url.length > 0) ?? [],
      };

      if (mode === 'create') {
        await createFullProduct(payload);
        router.push('/admin/products');
      } else if (productId) {
        await updateFullProduct(productId, payload);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const isLoading = loadingResources || initialLoading || loading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600">Se încarcă editorul de produs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la produse
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'create' ? 'Produs nou' : 'Editează produsul'}
            </h1>
            <p className="text-gray-600">
              Configurează toate detaliile produsului în tab-urile dedicate
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/admin/products')}>
              Anulează
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              <Save className="h-4 w-4" />
              Salvează produsul
            </Button>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          <p className="font-semibold mb-2">Ai câteva câmpuri care necesită atenție:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex flex-wrap gap-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'general' && (
            <GeneralTab
              data={formData}
              categories={resources.categories}
              onNameChange={handleNameChange}
              onFieldChange={updateField}
              onSlugChange={handleSlugChange}
              onImagesChange={handleImagesChange}
            />
          )}

          {activeTab === 'options' && formData.type === 'CONFIGURABLE' && (
            <OptionsTab
              data={formData}
              materials={resources.materials}
              printMethods={resources.printMethods}
              finishing={resources.finishing}
              onDimensionsChange={handleDimensionsChange}
              onMaterialsChange={(ids) => updateField('compatibleMaterials', ids)}
              onPrintMethodsChange={(ids) => updateField('compatiblePrintMethods', ids)}
              onFinishingChange={(ids) => updateField('compatibleFinishing', ids)}
              onOptionsChange={handleOptionsChange}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingTab
              pricing={formData.pricing}
              onChange={handlePricingChange}
              calculatePreviewPrice={calculatePreviewPrice}
            />
          )}

          {activeTab === 'production' && (
            <ProductionTab
              production={formData.production}
              machines={resources.machines}
              onChange={handleProductionChange}
            />
          )}

          {activeTab === 'seo' && (
            <SeoTab
              seo={formData.seo}
              slug={formData.slug}
              descriptionShort={formData.descriptionShort}
              onSlugChange={handleSlugChange}
              onSeoChange={handleSeoChange}
              onDescriptionShortChange={(value) => updateField('descriptionShort', value)}
            />
          )}

          {activeTab === 'preview' && (
            <PreviewTab data={formData} calculatePreviewPrice={calculatePreviewPrice} />
          )}
        </div>
      </div>
    </div>
  );
}
