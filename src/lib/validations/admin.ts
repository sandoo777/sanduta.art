import { z } from 'zod';
import { UserRole } from '@prisma/client';

// ==================== Product Schema ====================
export const productFormSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters'),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Price must be a positive number',
    }),
  
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  
  options: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, {
      message: 'Options must be valid JSON',
    }),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// ==================== Category Schema ====================
export const categoryFormSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and contain only letters, numbers, and hyphens')
    .refine((val) => !val.includes(' '), {
      message: 'Slug cannot contain spaces',
    }),
  
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format (must be hex color)')
    .default('#3B82F6'),
  
  icon: z.string()
    .min(1, 'Icon is required')
    .default('📦'),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// ==================== User Schema ====================
export const userFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  
  password: z.string()
    .optional()
    .refine((val) => {
      // Password required only for new users (will be validated at component level)
      // For existing users, password is optional
      if (!val || val === '') return true;
      return val.length >= 6;
    }, {
      message: 'Password must be at least 6 characters',
    }),
  
  role: z.nativeEnum(UserRole, {
    message: 'Invalid user role',
  }),
  
  active: z.boolean().default(true),
});

export type UserFormData = z.infer<typeof userFormSchema>;

// ==================== Customer Schema ====================
export const customerFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .optional()
    .or(z.literal('')),
  
  company: z.string()
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .optional()
    .or(z.literal('')),
  
  city: z.string()
    .optional()
    .or(z.literal('')),
  
  country: z.string()
    .optional()
    .or(z.literal('')),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

// ==================== Material Schema ====================
export const materialFormSchema = z.object({
  name: z.string()
    .min(1, 'Material name is required')
    .min(2, 'Material name must be at least 2 characters')
    .max(100, 'Material name must be less than 100 characters'),
  
  type: z.string()
    .min(1, 'Type is required'),
  
  unit: z.string()
    .min(1, 'Unit is required'),
  
  quantity: z.string()
    .min(1, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Quantity must be a non-negative number',
    }),
  
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Price must be a positive number',
    }),
  
  supplier: z.string().optional().or(z.literal('')),
});

export type MaterialFormData = z.infer<typeof materialFormSchema>;

// ==================== Machine Schema ====================
export const machineFormSchema = z.object({
  name: z.string()
    .min(1, 'Machine name is required')
    .min(2, 'Machine name must be at least 2 characters')
    .max(100, 'Machine name must be less than 100 characters'),
  
  type: z.string()
    .min(1, 'Type is required'),
  
  status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'BROKEN'], {
    message: 'Invalid machine status',
  }),
  
  capacity: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return !isNaN(Number(val)) && Number(val) > 0;
    }, {
      message: 'Capacity must be a positive number',
    }),
  
  location: z.string().optional().or(z.literal('')),
});

export type MachineFormData = z.infer<typeof machineFormSchema>;

// ==================== Finishing Schema ====================
export const finishingFormSchema = z.object({
  name: z.string()
    .min(1, 'Finishing name is required')
    .min(2, 'Finishing name must be at least 2 characters')
    .max(100, 'Finishing name must be less than 100 characters'),
  
  type: z.string()
    .min(1, 'Type is required'),
  
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Price must be a non-negative number',
    }),
  
  description: z.string().optional().or(z.literal('')),
});

export type FinishingFormData = z.infer<typeof finishingFormSchema>;

// ==================== Print Method Schema ====================
export const printMethodFormSchema = z.object({
  name: z.string()
    .min(1, 'Print method name is required')
    .min(2, 'Print method name must be at least 2 characters')
    .max(100, 'Print method name must be less than 100 characters'),
  
  type: z.string()
    .min(1, 'Type is required'),
  
  pricePerUnit: z.string()
    .min(1, 'Price per unit is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Price must be a non-negative number',
    }),
  
  description: z.string().optional().or(z.literal('')),
});

export type PrintMethodFormData = z.infer<typeof printMethodFormSchema>;

// ==================== Job Schema ====================
export const jobFormSchema = z.object({
  title: z.string()
    .min(1, 'Job title is required')
    .min(3, 'Job title must be at least 3 characters')
    .max(200, 'Job title must be less than 200 characters'),
  
  orderId: z.string()
    .min(1, 'Order ID is required'),
  
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    message: 'Invalid job status',
  }),
  
  assignedTo: z.string().optional().or(z.literal('')),
  
  deadline: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return !isNaN(Date.parse(val));
    }, {
      message: 'Invalid deadline date',
    }),
  
  notes: z.string().optional().or(z.literal('')),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
