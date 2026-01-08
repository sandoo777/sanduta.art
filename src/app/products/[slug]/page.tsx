import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Configurator } from '@/components/configurator/Configurator';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, active: true },
    select: { name: true, metaTitle: true, metaDescription: true, ogImage: true },
  });

  if (!product) {
    return { title: 'Produs negăsit' };
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || undefined,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || undefined,
      images: product.ogImage ? [{ url: product.ogImage }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, active: true },
    select: { id: true, slug: true, name: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <a href="/" className="hover:text-slate-900 transition-colors">
            Acasă
          </a>
          <span>/</span>
          <a href="/products" className="hover:text-slate-900 transition-colors">
            Produse
          </a>
          <span>/</span>
          <span className="font-medium text-slate-900">{product.name}</span>
        </nav>

        {/* Main Product Configurator */}
        <Configurator productId={product.id} />
      </div>
    </div>
  );
}
