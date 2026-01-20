import { z } from 'zod';
import { UserRole, OrderStatus, PaymentStatus } from '@prisma/client';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Accept phone numbers in various formats
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validateAddress(address: string): boolean {
  return address.trim().length >= 5;
}

export function validateCustomerName(name: string): boolean {
  return name.trim().length >= 2;
}

export function validateCheckoutForm(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  deliveryMethod: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateCustomerName(data.customerName)) {
    errors.push({
      field: 'customerName',
      message: 'Имя должно быть не менее 2 символов',
    });
  }

  if (!validateEmail(data.customerEmail)) {
    errors.push({
      field: 'customerEmail',
      message: 'Пожалуйста, введите корректный email адрес',
    });
  }

  if (!validatePhone(data.customerPhone)) {
    errors.push({
      field: 'customerPhone',
      message: 'Пожалуйста, введите корректный номер телефона',
    });
  }

  if (!data.city.trim()) {
    errors.push({
      field: 'city',
      message: 'Пожалуйста, выберите город',
    });
  }

  if (data.deliveryMethod === 'home' && !validateAddress(data.address)) {
    errors.push({
      field: 'address',
      message: 'Пожалуйста, введите корректный адрес (не менее 5 символов)',
    });
  }

  return errors;
}

/**
 * Zod Schemas pentru validare robustă
 */
export const emailSchema = z.string().email('Email invalid').trim().toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Parola trebuie să conțină minim 8 caractere')
  .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
  .regex(/[a-z]/, 'Parola trebuie să conțină cel puțin o literă mică')
  .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră');

export const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s\-()]{10,}$/, 'Număr de telefon invalid')
  .transform((val) => val.replace(/\s/g, ''));

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Parola este obligatorie'),
});

export const registerSchema = z.object({
  name: z.string().min(2).trim(),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(2).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).trim(),
  description: z.string().optional(),
  price: z.number().min(0),
  categoryId: z.string().cuid(),
});

// Order schemas
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
});

/**
 * Helper pentru validare cu error handling
 */
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (_error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    throw error;
  }
}

/**
 * Sanitize pentru prevenire XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
