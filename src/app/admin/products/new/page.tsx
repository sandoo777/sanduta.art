import { ProductForm } from '@/components/admin/products/builder/ProductForm';

export default function NewProductPage() {
  return (
    <div className="py-6">
      <ProductForm mode="create" />
    </div>
  );
}
