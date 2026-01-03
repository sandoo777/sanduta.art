"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  options?: any;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", image_url: "", options: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setForm({ ...form, image_url: data.url });
    } else {
      alert("Upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        image_url: form.image_url,
        options: form.options ? JSON.parse(form.options) : null,
      }),
    });

    if (res.ok) {
      fetchProducts();
      setForm({ name: "", category: "", price: "", image_url: "", options: "" });
      setEditing(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image_url: product.image_url || "",
      options: product.options ? JSON.stringify(product.options) : "",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products Management</h2>
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
            className="p-2 border rounded"
            disabled={uploading}
          />
          {uploading && <p>Uploading...</p>}
          <textarea
            placeholder="Options (JSON)"
            value={form.options}
            onChange={(e) => setForm({ ...form, options: e.target.value })}
            className="p-2 border rounded"
            rows={3}
          />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          {editing ? "Update" : "Add"} Product
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ name: "", category: "", price: "", image_url: "", options: "" });
            }}
            className="ml-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>
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