import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CatalogClient from '@/app/(public)/produse/CatalogClient';
import { Breadcrumbs, buildCategoryBreadcrumbs } from '@/components/public/Breadcrumbs';

interface SubcategoryPageProps {
  params: {
    slug: string;
    subcategory: string;
  };
}

// Generate static params for all parent/child combinations
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { active: true, parentId: { not: null } },
    include: {
      parent: {
        select: { slug: true },
      },
    },
  });

  return categories.map((category) => ({
    slug: category.parent!.slug,
    subcategory: category.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const subcategory = await prisma.category.findFirst({
    where: {
      slug: params.subcategory,
      active: true,
      parent: {
        slug: params.slug,
      },
    },
    include: {
      parent: {
        select: { name: true },
      },
    },
  });

  if (!subcategory) {
    return {
      title: 'Subcategorie nu a fost găsită',
    };
  }

  const title =
    subcategory.metaTitle ||
    `${subcategory.name} - ${subcategory.parent?.name} - Sanduta.Art`;
  const description =
    subcategory.metaDescription ||
    subcategory.description ||
    `Descoperă ${subcategory.name.toLowerCase()} în categoria ${subcategory.parent?.name}. Calitate superioară, prețuri competitive.`;

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

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const subcategory = await prisma.category.findFirst({
    where: {
      slug: params.subcategory,
      active: true,
      parent: {
        slug: params.slug,
      },
    },
    include: {
      parent: {
        select: { id: true, name: true, slug: true, icon: true },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!subcategory) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subcategory Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs with schema.org markup */}
          <Breadcrumbs
            items={buildCategoryBreadcrumbs({
              name: subcategory.name,
              slug: subcategory.slug,
              parent: subcategory.parent ? {
                name: subcategory.parent.name,
                slug: subcategory.parent.slug,
              } : null,
            })}
            className="mb-4 text-blue-100"
          />

          {/* Subcategory Info */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {subcategory.icon && (
                <span className="text-5xl md:text-6xl mr-3">
                  {subcategory.icon}
                </span>
              )}
              {subcategory.name}
            </h1>
            {subcategory.description && (
              <p className="text-xl text-blue-100">{subcategory.description}</p>
            )}
            <div className="mt-6 flex items-center justify-center text-sm">
              <svg
                className="w-5 h-5 mr-2"
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
                {subcategory._count.products}{' '}
                {subcategory._count.products === 1 ? 'produs' : 'produse'}{' '}
                disponibile
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CatalogClient initialCategoryId={subcategory.id} />
      </div>
    </div>
  );
}
