import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CatalogClient from '@/app/(public)/produse/CatalogClient';
import { Breadcrumbs, buildCategoryBreadcrumbs } from '@/components/public/Breadcrumbs';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { slug: true },
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug, active: true },
    select: {
      name: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      icon: true,
    },
  });

  if (!category) {
    return {
      title: 'Categorie nu a fost găsită',
    };
  }

  const title = category.metaTitle || `${category.name} - Sanduta.Art`;
  const description =
    category.metaDescription ||
    category.description ||
    `Descoperă produsele noastre de ${category.name.toLowerCase()}. Calitate superioară, prețuri competitive, livrare rapidă în Moldova.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ro_RO',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug, active: true },
    include: {
      parent: {
        select: { name: true, slug: true, icon: true },
      },
      children: {
        where: { active: true },
        select: { id: true, name: true, slug: true, icon: true },
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Get products from this category and all subcategories
  const categoryIds = [
    category.id,
    ...category.children.map((child) => child.id),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs with schema.org markup */}
          <Breadcrumbs
            items={buildCategoryBreadcrumbs({
              name: category.name,
              slug: category.slug,
              parent: category.parent,
            })}
            className="mb-4 text-blue-100"
          />

          {/* Category Info */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category.icon && (
                <span className="text-5xl md:text-6xl mr-3">
                  {category.icon}
                </span>
              )}
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-blue-100">{category.description}</p>
            )}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span>
                  {category._count.products}{' '}
                  {category._count.products === 1 ? 'produs' : 'produse'}
                </span>
              </div>
              {category.children.length > 0 && (
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>
                    {category.children.length} subcategorii
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Grid (if parent category) */}
      {category.children.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Subcategorii
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.children.map((subcategory) => (
              <a
                key={subcategory.id}
                href={`/produse/${category.slug}/${subcategory.slug}`}
                className="group relative rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="text-center">
                  {subcategory.icon && (
                    <div className="text-4xl mb-3">{subcategory.icon}</div>
                  )}
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {subcategory.name}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Products Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CatalogClient initialCategoryId={category.id} />
      </div>
    </div>
  );
}
