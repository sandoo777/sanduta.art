"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormData } from "@/lib/validations/admin";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Product } from '@/types/models';
import { useProducts } from '@/domains/products/hooks/useProducts';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const { getProducts, createProduct, updateProduct, deleteProduct, loading } = useProducts();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      image_url: "",
      options: "",
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const result = await getProducts();
    if (result.success && result.data) {
      setProducts(result.data.products);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    // Note: Upload still uses direct fetch as it's a file upload
    // Could be extracted to a separate uploadService later
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      form.setValue("image_url", data.url);
    } else {
      alert("Upload failed");
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const productData = {
      name: data.name,
      categoryId: data.category, // Note: May need adjustment based on schema
      price: parseFloat(data.price),
      imageUrl: data.image_url || undefined,
      options: data.options ? JSON.parse(data.options) : null,
      // Add other required fields based on CreateProductDTO
      type: 'STANDARD' as const,
      active: true,
    };

    let result;
    if (editing) {
      result = await updateProduct(editing.id, productData);
    } else {
      result = await createProduct(productData as any);
    }

    if (result.success) {
      fetchProducts();
      form.reset();
      setEditing(null);
    } else {
      alert(result.error || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    form.reset({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image_url: product.image_url || "",
      options: product.options ? JSON.stringify(product.options) : "",
    });
  };

  const handleCancel = () => {
    setEditing(null);
    form.reset();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      const result = await deleteProduct(id);
      if (result.success) {
        fetchProducts();
      } else {
        alert(result.error || 'Failed to delete product');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products Management</h2>
      <Form form={form} onSubmit={onSubmit} className="mb-8 p-4 border rounded">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <div>
                <FormLabel>Name</FormLabel>
                <Input {...field} placeholder="Product name" />
                <FormMessage />
              </div>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <div>
                <FormLabel>Category</FormLabel>
                <Input {...field} placeholder="Category" />
                <FormMessage />
              </div>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <div>
                <FormLabel>Price</FormLabel>
                <Input {...field} type="number" step="0.01" placeholder="0.00" />
                <FormMessage />
              </div>
            )}
          />
          
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <div>
                <FormLabel>Image URL</FormLabel>
                <Input {...field} placeholder="https://..." />
                <FormMessage />
              </div>
            )}
          />
          
          <div>
            <FormLabel>Upload Image</FormLabel>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
          </div>
          
          <FormField
            control={form.control}
            name="options"
            render={({ field }) => (
              <div className="col-span-2">
                <FormLabel>Options (JSON)</FormLabel>
                <textarea
                  {...field}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder='{"key": "value"}'
                />
                <FormMessage />
              </div>
            )}
          />
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {editing ? "Update" : "Add"} Product
          </Button>
          {editing && (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Form>
      </Form>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-300 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Image</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Name</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Category</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Price</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-2 md:px-4 py-3 border-r">
                      {product.image_url && <img src={product.image_url} alt={product.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded" />}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{product.name}</td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{product.category}</td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r whitespace-nowrap">{product.price} ₽</td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded text-xs md:text-sm hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs md:text-sm hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}