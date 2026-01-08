import { ProductForm } from '@/components/admin/products/builder/ProductForm';

interface EditProductPageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <div className="py-6">
      <ProductForm mode="edit" productId={params.id} />
    </div>
  );
}
