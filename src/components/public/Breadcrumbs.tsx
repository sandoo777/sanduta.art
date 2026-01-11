'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs component with schema.org BreadcrumbList markup
 * 
 * Features:
 * - SEO-optimized with structured data
 * - Accessible navigation
 * - Responsive design
 * - Google Rich Results compatible
 * 
 * Usage:
 * ```tsx
 * <Breadcrumbs items={[
 *   { name: 'Acasă', href: '/' },
 *   { name: 'Marketing', href: '/produse/marketing' },
 *   { name: 'Flyere', href: '/produse/marketing/flyere' }
 * ]} />
 * ```
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Generate schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sanduta.art'}${item.href}`,
    })),
  };

  return (
    <>
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />

      {/* Visual breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-1 text-sm ${className}`}
      >
        <ol className="flex items-center space-x-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;

            return (
              <li key={item.href} className="flex items-center space-x-1">
                {/* Separator (except for first item) */}
                {!isFirst && (
                  <ChevronRight
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                )}

                {/* Breadcrumb item */}
                {isLast ? (
                  // Current page - not a link
                  <span
                    className="font-medium text-gray-900"
                    aria-current="page"
                  >
                    {isFirst && (
                      <Home className="mr-1 inline h-4 w-4" aria-hidden="true" />
                    )}
                    {item.name}
                  </span>
                ) : (
                  // Link to parent page
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-500 transition-colors hover:text-primary hover:underline"
                  >
                    {isFirst && (
                      <Home className="mr-1 h-4 w-4" aria-hidden="true" />
                    )}
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * Helper function to build breadcrumbs for category pages
 * 
 * Usage:
 * ```tsx
 * const breadcrumbs = buildCategoryBreadcrumbs({
 *   name: 'Flyere',
 *   slug: 'flyere',
 *   parent: {
 *     name: 'Marketing',
 *     slug: 'marketing'
 *   }
 * });
 * ```
 */
export function buildCategoryBreadcrumbs(category: {
  name: string;
  slug: string;
  parent?: { name: string; slug: string } | null;
}): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Acasă', href: '/' },
  ];

  // Add parent if exists
  if (category.parent) {
    breadcrumbs.push({
      name: category.parent.name,
      href: `/produse/${category.parent.slug}`,
    });
  }

  // Add current category
  breadcrumbs.push({
    name: category.name,
    href: category.parent
      ? `/produse/${category.parent.slug}/${category.slug}`
      : `/produse/${category.slug}`,
  });

  return breadcrumbs;
}

/**
 * Helper function to build breadcrumbs for product pages
 * 
 * Usage:
 * ```tsx
 * const breadcrumbs = buildProductBreadcrumbs({
 *   name: 'Flyer A5 Premium',
 *   slug: 'flyer-a5-premium',
 *   category: {
 *     name: 'Flyere',
 *     slug: 'flyere',
 *     parent: {
 *       name: 'Marketing',
 *       slug: 'marketing'
 *     }
 *   }
 * });
 * ```
 */
export function buildProductBreadcrumbs(product: {
  name: string;
  slug: string;
  category?: {
    name: string;
    slug: string;
    parent?: { name: string; slug: string } | null;
  } | null;
}): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Acasă', href: '/' },
  ];

  if (product.category) {
    // Add parent category if exists
    if (product.category.parent) {
      breadcrumbs.push({
        name: product.category.parent.name,
        href: `/produse/${product.category.parent.slug}`,
      });
    }

    // Add category
    breadcrumbs.push({
      name: product.category.name,
      href: product.category.parent
        ? `/produse/${product.category.parent.slug}/${product.category.slug}`
        : `/produse/${product.category.slug}`,
    });
  }

  // Add product
  breadcrumbs.push({
    name: product.name,
    href: `/products/${product.slug}`,
  });

  return breadcrumbs;
}
