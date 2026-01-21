# Forms Guide — React Hook Form + Zod Pattern

**Ghid comprehensiv pentru implementarea formularelor în sanduta.art**

## 📚 Cuprins

- [Overview](#overview)
- [Infrastructură](#infrastructură)
- [Quick Start](#quick-start)
- [Field Types](#field-types)
  - [Input Fields](#input-fields)
  - [Select Dropdowns](#select-dropdowns)
  - [Checkboxes](#checkboxes)
  - [File Upload](#file-upload)
- [Advanced Patterns](#advanced-patterns)
  - [Nested Forms](#nested-forms)
  - [Async Validation](#async-validation)
  - [Dynamic Fields](#dynamic-fields)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Toate formularele din sanduta.art folosesc **react-hook-form** pentru state management și **Zod** pentru validare. Acest pattern elimină boilerplate code și oferă validare type-safe.

### Stack

- **react-hook-form** 7.71.1 — Form state & validation
- **@hookform/resolvers** 5.2.2 — Zod integration
- **zod** 4.3.5 — TypeScript-first schema validation
- **Custom components** — Form, FormField, FormLabel, FormMessage

### Avantaje

✅ **Type Safety**: TypeScript infers tipurile din Zod schema  
✅ **Less Code**: ~100 linii eliminate per formular vs useState manual  
✅ **Centralized Validation**: Toate schema-urile în `src/lib/validations/`  
✅ **Better UX**: Validare real-time, error messages consistente  
✅ **Performance**: Re-render optimizat, doar field-urile modificate

---

## Infrastructură

### Componente Core

```
src/components/ui/form/
  ├── Form.tsx          # Form wrapper component
  ├── FormField.tsx     # Field render prop component
  ├── FormLabel.tsx     # Label cu indicator required
  ├── FormMessage.tsx   # Error message display
  └── index.ts          # Exports
```

### Validations

```
src/lib/validations/
  ├── admin.ts          # Admin panel schemas (12+ schemas)
  ├── auth.ts           # Auth schemas (login, register, etc.)
  └── checkout.ts       # User-facing schemas (checkout, profile, etc.)
```

---

## Quick Start

### 1. Definește Schema (Zod)

```typescript
// src/lib/validations/admin.ts
import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters'),
  
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Price must be a positive number',
    }),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
```

### 2. Setup useForm Hook

```typescript
// ProductForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormData } from "@/lib/validations/admin";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProductForm({ product, onSubmit, onClose }) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price?.toString() || "",
      category: product?.category || "",
      active: product?.active ?? true,
    },
  });

  const { formState: { isSubmitting } } = form;

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Form form={form} onSubmit={handleFormSubmit}>
      {/* Fields aici */}
    </Form>
  );
}
```

### 3. Adaugă FormFields

```tsx
<Form form={form} onSubmit={handleFormSubmit} className="space-y-4">
  {/* Field-urile tale */}
  
  <div className="flex gap-3 pt-4">
    <Button type="button" variant="ghost" onClick={onClose}>
      Cancel
    </Button>
    <Button type="submit" variant="primary" loading={isSubmitting}>
      Save
    </Button>
  </div>
</Form>
```

---

## Field Types

### Input Fields

#### Text Input

```tsx
<FormField
  name="name"
  render={({ field }) => (
    <div>
      <FormLabel required>Product Name</FormLabel>
      <Input
        {...field}
        placeholder="ex: Vinyl Banner 3x2m"
      />
      <FormMessage />
    </div>
  )}
/>
```

#### Number Input

```tsx
<FormField
  name="price"
  render={({ field }) => (
    <div>
      <FormLabel required>Price (MDL)</FormLabel>
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        {...field}
        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
      />
      <FormMessage />
    </div>
  )}
/>
```

**⚠️ Important**: Pentru number inputs, convertește valoarea în onChange:

```tsx
onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
// sau pentru integers:
onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
```

#### Email Input

```tsx
<FormField
  name="email"
  render={({ field }) => (
    <div>
      <FormLabel required>Email</FormLabel>
      <Input
        type="email"
        {...field}
        placeholder="contact@sanduta.art"
      />
      <FormMessage />
    </div>
  )}
/>
```

Schema Zod:
```typescript
email: z.string()
  .email('Invalid email format')
  .min(1, 'Email is required'),
```

#### Password Input

```tsx
<FormField
  name="password"
  render={({ field }) => (
    <div>
      <FormLabel required>Password</FormLabel>
      <Input
        type="password"
        {...field}
        placeholder="••••••••"
      />
      <p className="text-xs text-gray-500 mt-1">
        Minimum 6 characters
      </p>
      <FormMessage />
    </div>
  )}
/>
```

Schema Zod:
```typescript
password: z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long'),
```

#### Textarea

```tsx
<FormField
  name="description"
  render={({ field }) => (
    <div>
      <FormLabel>Description</FormLabel>
      <textarea
        {...field}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Product description..."
      />
      <FormMessage />
    </div>
  )}
/>
```

---

### Select Dropdowns

#### Basic Select

```tsx
<FormField
  name="category"
  render={({ field }) => (
    <div>
      <FormLabel required>Category</FormLabel>
      <select
        {...field}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select category</option>
        <option value="banners">Banners</option>
        <option value="stickers">Stickers</option>
        <option value="business-cards">Business Cards</option>
      </select>
      <FormMessage />
    </div>
  )}
/>
```

Schema Zod:
```typescript
category: z.string()
  .min(1, 'Category is required'),
```

#### Dynamic Select (from API)

```tsx
function ProductForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    const data = await fetch('/api/categories').then(r => r.json());
    setCategories(data);
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <FormField
        name="categoryId"
        render={({ field }) => (
          <div>
            <FormLabel required>Category</FormLabel>
            <select
              {...field}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <FormMessage />
          </div>
        )}
      />
    </Form>
  );
}
```

#### Enum Select

```tsx
// Schema
import { UserRole } from '@prisma/client';

export const userFormSchema = z.object({
  role: z.nativeEnum(UserRole, {
    message: 'Invalid user role',
  }),
});

// Component
<FormField
  name="role"
  render={({ field }) => (
    <div>
      <FormLabel required>Role</FormLabel>
      <select
        {...field}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      >
        <option value="ADMIN">Admin</option>
        <option value="MANAGER">Manager</option>
        <option value="OPERATOR">Operator</option>
        <option value="VIEWER">Viewer</option>
      </select>
      <FormMessage />
    </div>
  )}
/>
```

---

### Checkboxes

#### Single Checkbox

```tsx
<FormField
  name="active"
  render={({ field }) => (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id="active"
        checked={field.value}
        onChange={field.onChange}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label htmlFor="active" className="text-sm font-medium text-gray-700">
        Product is active
      </label>
      <FormMessage />
    </div>
  )}
/>
```

Schema Zod:
```typescript
active: z.boolean().default(true),
```

#### Checkbox Group (Multiple Selection)

```tsx
// Schema
export const printMethodFormSchema = z.object({
  materialIds: z.array(z.string())
    .min(1, 'Select at least one material'),
});

// Component
function PrintMethodForm() {
  const [materials, setMaterials] = useState<Material[]>([]);
  
  const toggleMaterial = (materialId: string) => {
    const currentIds = form.getValues("materialIds") || [];
    const newIds = currentIds.includes(materialId)
      ? currentIds.filter((id) => id !== materialId)
      : [...currentIds, materialId];
    form.setValue("materialIds", newIds);
  };

  return (
    <FormField
      name="materialIds"
      render={({ field }) => (
        <div>
          <FormLabel required>Compatible Materials</FormLabel>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
            {materials.map((material) => (
              <label
                key={material.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={field.value?.includes(material.id)}
                  onChange={() => toggleMaterial(material.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{material.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Selected: {field.value?.length || 0}
          </p>
          <FormMessage />
        </div>
      )}
    />
  );
}
```

**💡 Tip**: Folosește `form.setValue()` pentru a actualiza array-uri în mod programatic.

---

### File Upload

#### Single File Upload

```tsx
// Schema
export const productFormSchema = z.object({
  image: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File must be less than 5MB',
    })
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'Only JPEG, PNG, and WebP formats are supported',
    }),
});

// Component
<FormField
  name="image"
  render={({ field: { value, onChange, ...fieldProps } }) => (
    <div>
      <FormLabel required>Product Image</FormLabel>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onChange(file);
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        {...fieldProps}
      />
      {value && (
        <p className="text-sm text-gray-600 mt-1">
          Selected: {value.name} ({(value.size / 1024).toFixed(2)} KB)
        </p>
      )}
      <FormMessage />
    </div>
  )}
/>
```

#### File Upload with Preview

```tsx
function ProductForm() {
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleFileChange = (file: File | null, onChange: (file: File) => void) => {
    if (file) {
      onChange(file);
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <FormField
      name="image"
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <div>
          <FormLabel>Product Image</FormLabel>
          
          {/* Preview */}
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}
          
          {/* File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null, onChange)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            {...fieldProps}
          />
          <FormMessage />
        </div>
      )}
    />
  );
}
```

#### Upload to Cloudinary

```tsx
const onSubmit = async (data: ProductFormData) => {
  let imageUrl = existingProduct?.image_url;
  
  // Upload image if provided
  if (data.image) {
    const formData = new FormData();
    formData.append('file', data.image);
    formData.append('upload_preset', 'sanduta_products');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const result = await response.json();
    imageUrl = result.secure_url;
  }
  
  // Submit with imageUrl
  await createProduct({
    ...data,
    image_url: imageUrl,
  });
};
```

---

## Advanced Patterns

### Nested Forms

#### Field Array Pattern

```tsx
// Schema
export const orderFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price must be positive'),
    })
  ).min(1, 'At least one item is required'),
});

// Component
import { useFieldArray } from 'react-hook-form';

function OrderForm() {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      items: [{ productId: "", quantity: 1, price: 0 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <Form form={form} onSubmit={handleSubmit}>
      {/* Customer Name */}
      <FormField
        name="customerName"
        render={({ field }) => (
          <div>
            <FormLabel required>Customer Name</FormLabel>
            <Input {...field} />
            <FormMessage />
          </div>
        )}
      />
      
      {/* Items Array */}
      <div className="space-y-4">
        <h3 className="font-semibold">Order Items</h3>
        
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {/* Product */}
              <FormField
                name={`items.${index}.productId`}
                render={({ field }) => (
                  <div>
                    <FormLabel>Product</FormLabel>
                    <select {...field} className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Select product</option>
                      {/* Products here */}
                    </select>
                    <FormMessage />
                  </div>
                )}
              />
              
              {/* Quantity */}
              <FormField
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <div>
                    <FormLabel>Quantity</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                    <FormMessage />
                  </div>
                )}
              />
              
              {/* Price */}
              <FormField
                name={`items.${index}.price`}
                render={({ field }) => (
                  <div>
                    <FormLabel>Price</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    <FormMessage />
                  </div>
                )}
              />
            </div>
            
            {/* Remove Button */}
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove Item
              </button>
            )}
          </div>
        ))}
        
        {/* Add Item Button */}
        <button
          type="button"
          onClick={() => append({ productId: "", quantity: 1, price: 0 })}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
        >
          + Add Item
        </button>
      </div>
      
      <Button type="submit">Submit Order</Button>
    </Form>
  );
}
```

---

### Async Validation

#### Server-Side Validation

```tsx
// Schema with async refine
export const userFormSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
});

// Component cu async validation
function UserForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onBlur', // Validate on blur for async checks
  });
  
  // Async email check
  const checkEmailAvailability = async (email: string) => {
    const response = await fetch(`/api/users/check-email?email=${email}`);
    const { available } = await response.json();
    return available;
  };
  
  return (
    <Form form={form} onSubmit={handleSubmit}>
      <FormField
        name="email"
        render={({ field }) => (
          <div>
            <FormLabel required>Email</FormLabel>
            <Input
              type="email"
              {...field}
              onBlur={async (e) => {
                field.onBlur();
                
                const email = e.target.value;
                if (email && /\S+@\S+\.\S+/.test(email)) {
                  const available = await checkEmailAvailability(email);
                  if (!available) {
                    form.setError("email", {
                      type: "manual",
                      message: "Email is already taken",
                    });
                  }
                }
              }}
            />
            <FormMessage />
          </div>
        )}
      />
    </Form>
  );
}
```

#### Custom Validation with API

```tsx
// Material consumption form - check stock
function MaterialConsumption({ material }) {
  const form = useForm<MaterialConsumptionFormData>({
    resolver: zodResolver(materialConsumptionFormSchema),
  });
  
  const onSubmit = async (data: MaterialConsumptionFormData) => {
    // Custom validation before submit
    if (data.quantity > material.stock) {
      form.setError("quantity", {
        type: "manual",
        message: `Stoc insuficient (disponibil: ${material.stock} ${material.unit})`,
      });
      return;
    }
    
    await consumeMaterial(material.id, data);
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField
        name="quantity"
        render={({ field }) => (
          <div>
            <FormLabel required>Quantity ({material.unit})</FormLabel>
            <Input
              type="number"
              step="0.01"
              max={material.stock}
              placeholder={`Max ${material.stock}`}
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
            />
            <FormMessage />
          </div>
        )}
      />
    </Form>
  );
}
```

---

### Dynamic Fields

#### Conditional Fields

```tsx
function ProductForm() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });
  
  const productType = form.watch("type");

  return (
    <Form form={form} onSubmit={handleSubmit}>
      {/* Type Select */}
      <FormField
        name="type"
        render={({ field }) => (
          <div>
            <FormLabel>Product Type</FormLabel>
            <select {...field}>
              <option value="digital">Digital Print</option>
              <option value="offset">Offset Print</option>
              <option value="vinyl">Vinyl Cut</option>
            </select>
          </div>
        )}
      />
      
      {/* Conditional: Show only for digital */}
      {productType === "digital" && (
        <FormField
          name="resolution"
          render={({ field }) => (
            <div>
              <FormLabel>Resolution (DPI)</FormLabel>
              <Input type="number" {...field} />
            </div>
          )}
        />
      )}
      
      {/* Conditional: Show only for vinyl */}
      {productType === "vinyl" && (
        <FormField
          name="vinylType"
          render={({ field }) => (
            <div>
              <FormLabel>Vinyl Type</FormLabel>
              <select {...field}>
                <option value="glossy">Glossy</option>
                <option value="matte">Matte</option>
              </select>
            </div>
          )}
        />
      )}
    </Form>
  );
}
```

#### Watch Multiple Fields

```tsx
function PricingForm() {
  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingFormSchema),
  });
  
  const { watch, setValue } = form;
  const quantity = watch("quantity");
  const pricePerUnit = watch("pricePerUnit");
  
  // Auto-calculate total
  useEffect(() => {
    if (quantity && pricePerUnit) {
      const total = quantity * pricePerUnit;
      setValue("totalPrice", total);
    }
  }, [quantity, pricePerUnit, setValue]);

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <FormField name="quantity" render={({ field }) => (
        <div>
          <FormLabel>Quantity</FormLabel>
          <Input
            type="number"
            {...field}
            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
          />
        </div>
      )} />
      
      <FormField name="pricePerUnit" render={({ field }) => (
        <div>
          <FormLabel>Price per Unit</FormLabel>
          <Input
            type="number"
            step="0.01"
            {...field}
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      )} />
      
      <FormField name="totalPrice" render={({ field }) => (
        <div>
          <FormLabel>Total Price (auto-calculated)</FormLabel>
          <Input {...field} disabled className="bg-gray-100" />
        </div>
      )} />
    </Form>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Centralize Schemas**
   ```typescript
   // ✅ Good - în src/lib/validations/admin.ts
   export const productFormSchema = z.object({ ... });
   export type ProductFormData = z.infer<typeof productFormSchema>;
   ```

2. **Use Type Inference**
   ```typescript
   // ✅ Good
   const form = useForm<ProductFormData>({
     resolver: zodResolver(productFormSchema),
   });
   ```

3. **Convert Number Inputs**
   ```typescript
   // ✅ Good
   <Input
     type="number"
     {...field}
     onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
   />
   ```

4. **Provide Default Values**
   ```typescript
   // ✅ Good
   defaultValues: {
     name: product?.name || "",
     price: product?.price || undefined,
     active: product?.active ?? true,
   }
   ```

5. **Use FormMessage for Errors**
   ```tsx
   // ✅ Good
   <FormField name="email" render={({ field }) => (
     <div>
       <FormLabel>Email</FormLabel>
       <Input {...field} />
       <FormMessage /> {/* Auto-displays errors */}
     </div>
   )} />
   ```

6. **Loading States**
   ```tsx
   // ✅ Good - Button component cu loading prop
   <Button type="submit" loading={isSubmitting}>
     Save Product
   </Button>
   ```

### ❌ DON'T

1. **❌ Don't Use useState for Form Data**
   ```typescript
   // ❌ Bad
   const [formData, setFormData] = useState({ name: "", price: 0 });
   
   // ✅ Good
   const form = useForm<ProductFormData>({ ... });
   ```

2. **❌ Don't Duplicate Validation**
   ```typescript
   // ❌ Bad - validare dublată
   const validate = () => {
     if (!formData.name) return "Name is required";
   };
   
   // ✅ Good - folosește Zod schema
   name: z.string().min(1, 'Name is required'),
   ```

3. **❌ Don't Forget Type Conversion**
   ```tsx
   // ❌ Bad - string în loc de number
   <Input type="number" {...field} />
   
   // ✅ Good
   <Input
     type="number"
     {...field}
     onChange={(e) => field.onChange(parseFloat(e.target.value))}
   />
   ```

4. **❌ Don't Hardcode Error Messages**
   ```tsx
   // ❌ Bad
   {errors.email && <p className="text-red-500">{errors.email}</p>}
   
   // ✅ Good
   <FormMessage />
   ```

5. **❌ Don't Submit Without Validation**
   ```tsx
   // ❌ Bad
   const handleSubmit = async (e) => {
     e.preventDefault();
     await onSubmit(formData);
   };
   
   // ✅ Good
   <Form form={form} onSubmit={handleFormSubmit}>
   ```

---

## Troubleshooting

### "Cannot read property 'onChange' of undefined"

**Cauză**: Field name nu există în schema sau defaultValues.

**Soluție**:
```typescript
// Verifică că toate field-urile sunt în schema
export const schema = z.object({
  email: z.string(),  // ← trebuie să existe
});

// Și în defaultValues
defaultValues: {
  email: "",  // ← trebuie să fie prezent
}
```

---

### Number Field Returns String

**Cauză**: Input type="number" returnează string implicit.

**Soluție**:
```tsx
<Input
  type="number"
  {...field}
  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
  //                               ^^^^^^^^^^^^ convertește explicit
/>
```

---

### Form Doesn't Reset After Submit

**Cauză**: form.reset() nu este apelat.

**Soluție**:
```typescript
const onSubmit = async (data: FormData) => {
  await submitForm(data);
  form.reset();  // ← resetează după submit
  onClose();
};
```

---

### Validation Doesn't Work

**Cauză**: resolver lipsește sau schema greșită.

**Soluție**:
```typescript
// ✅ Verifică că resolver este setat
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),  // ← obligatoriu pentru Zod
  defaultValues: { ... },
});
```

---

### Checkbox Always False

**Cauză**: Default value lipsește pentru boolean fields.

**Soluție**:
```typescript
// Schema
active: z.boolean().default(true),

// Default values
defaultValues: {
  active: product?.active ?? true,  // ← folosește ?? pentru boolean
}
```

---

### File Upload Doesn't Work

**Cauză**: FormData nu este folosit pentru file uploads.

**Soluție**:
```typescript
const onSubmit = async (data: FormData) => {
  const formData = new FormData();
  formData.append('file', data.image);
  formData.append('name', data.name);
  
  await fetch('/api/upload', {
    method: 'POST',
    body: formData,  // ← FormData, nu JSON
  });
};
```

---

### Async Validation Flickers

**Cauză**: Validation mode greșit.

**Soluție**:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',  // ← validează doar pe blur pentru async
});
```

---

### Array Field Doesn't Update

**Cauză**: form.setValue() lipsește pentru dynamic arrays.

**Soluție**:
```typescript
// ❌ Bad
setSelectedIds([...selectedIds, id]);

// ✅ Good
const newIds = [...form.getValues("selectedIds"), id];
form.setValue("selectedIds", newIds);
```

---

## Resurse

### Documentație

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Form Components API](../src/components/ui/form/README.md)

### Exemple în Proiect

**Auth Forms** (4 formulare):
- `src/app/(auth)/login/_components/LoginForm.tsx`
- `src/app/(auth)/register/_components/RegisterForm.tsx`
- `src/app/(auth)/forgot-password/_components/ForgotPasswordForm.tsx`
- `src/app/(auth)/reset-password/_components/ResetPasswordForm.tsx`

**User Panel Forms** (4 formulare):
- `src/app/profile/_components/ProfileForm.tsx`
- `src/app/my-orders/_components/OrderFilterForm.tsx`
- `src/app/checkout/_components/CheckoutForm.tsx`
- `src/app/support/_components/SupportForm.tsx`

**Admin Panel Forms** (12+ formulare):
- `src/app/admin/products/_components/ProductForm.tsx`
- `src/app/admin/categories/_components/CategoryModal.tsx`
- `src/app/admin/users/_components/UserModal.tsx`
- `src/app/admin/materials/_components/MaterialModal.tsx`
- `src/app/admin/machines/_components/MachineForm.tsx`
- `src/app/admin/finishing/_components/FinishingForm.tsx`
- `src/app/admin/print-methods/_components/PrintMethodForm.tsx`
- `src/app/admin/production/_components/JobModal.tsx`
- `src/app/admin/settings/system/_components/SystemSettingsForm.tsx`
- și altele...

### Schemas

**Auth**: `src/lib/validations/auth.ts`  
**Admin**: `src/lib/validations/admin.ts`  
**Checkout**: `src/lib/validations/checkout.ts`

---

## Changelog

**v1.0.0** (2026-01-20)
- ✅ Initial release
- ✅ 20+ forme refactorizate
- ✅ Pattern standardizat în tot proiectul
- ✅ Documentație completă cu exemple

---

**Întrebări?** Consultă exemplele din proiect sau verifică [React Hook Form API](https://react-hook-form.com/api).
