import type { ProductSEO } from '@/modules/products/productBuilder.types';

interface SeoTabProps {
  seo?: ProductSEO;
  slug: string;
  descriptionShort?: string;
  onSlugChange: (value: string, lock?: boolean) => void;
  onSeoChange: (seo?: ProductSEO) => void;
  onDescriptionShortChange: (value: string) => void;
}

type SeoField = keyof ProductSEO;

export function SeoTab({
  seo,
  slug,
  descriptionShort,
  onSlugChange,
  onSeoChange,
  onDescriptionShortChange,
}: SeoTabProps) {
  const value: ProductSEO = seo ?? { metaTitle: '', metaDescription: '', ogImage: '' };

  const handleSeoField = (field: SeoField, newValue: string) => {
    const next = { ...value, [field]: newValue };
    onSeoChange(next);
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-gray-900">Slug și descriere scurtă</h3>
        <p className="text-sm text-gray-600">Optimizări pentru URL și snippet</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(event) => onSlugChange(event.target.value, true)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">/produse/{slug || 'slug'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Descriere scurtă (carduri)</label>
            <textarea
              rows={3}
              value={descriptionShort ?? ''}
              onChange={(event) => onDescriptionShortChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Mesaj concis pentru listări și preview"
            />
            <p className="text-xs text-gray-500 text-right">{descriptionShort?.length ?? 0}/160 caractere recomandate</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Meta tags</h3>
          <p className="text-sm text-gray-600">Optimizează modul în care produsul apare în căutări și social media</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Meta title</label>
            <input
              type="text"
              maxLength={60}
              value={value.metaTitle ?? ''}
              onChange={(event) => handleSeoField('metaTitle', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Flyere A5 Premium - Print Rapid"
            />
            <p className="text-xs text-gray-500 text-right">{value.metaTitle?.length ?? 0}/60</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Meta description</label>
            <textarea
              rows={4}
              maxLength={160}
              value={value.metaDescription ?? ''}
              onChange={(event) => handleSeoField('metaDescription', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Print profesional pe hârtie lucioasă, tiraje flexibile, livrare rapidă în 48h."
            />
            <p className="text-xs text-gray-500 text-right">{value.metaDescription?.length ?? 0}/160</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Imagine Open Graph</label>
          <input
            type="text"
            value={value.ogImage ?? ''}
            onChange={(event) => handleSeoField('ogImage', event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="https://cdn.sanduta.art/og/flyere-a5.png"
          />
          <p className="text-xs text-gray-500 mt-1">
            Folosește imagini 1200x630 px pentru partajare optimă pe social media.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview Google</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-sm text-[#1a0dab]">{value.metaTitle || 'Titlu optimizat pentru SEO'}</p>
          <p className="text-xs text-[#4d5156]">sanduta.art/produse/{slug || 'slug'}</p>
          <p className="text-sm text-[#4d5156]">
            {value.metaDescription || descriptionShort || 'Adaugă o descriere clară și concisă pentru a crește rata de click din Google.'}
          </p>
        </div>
      </section>
    </div>
  );
}
