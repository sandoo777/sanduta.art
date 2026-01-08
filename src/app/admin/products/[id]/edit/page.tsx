import { ProductForm } from '@/components/admin/products/builder/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return (
    <div className="py-6">
      <ProductForm mode="edit" productId={id} />
    </div>
  );
}
