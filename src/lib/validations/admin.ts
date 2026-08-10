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
  
  parentId: z.string()
    .nullable()
    .optional()
    .refine((val) => val === null || val === undefined || val.length > 0, {
      message: 'Parent ID must be a valid string or null',
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
const optionalMaterialNumber = (message: string) => z.string()
  .optional()
  .or(z.literal(''))
  .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
    message,
  });

export const materialFormSchema = z.object({
  name: z.string()
    .min(1, 'Material name is required')
    .min(2, 'Material name must be at least 2 characters')
    .max(100, 'Material name must be less than 100 characters'),

  categoryId: z.string().min(1, 'Category is required'),

  consumptionType: z.enum(['AREA_BASED', 'DIRECT']).default('AREA_BASED'),

  active: z.boolean().default(true),

  sku: z.string().max(100, 'SKU must be less than 100 characters').optional().or(z.literal('')),

  unit: z.enum(['liter', 'ml', 'gram', 'kg', 'unit', 'm2', 'meter', 'pcs']),

  stock: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Stock must be a non-negative number',
    }),

  minStock: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Minimum stock must be a non-negative number',
    }),

  purchasePrice: optionalMaterialNumber('Prețul de achiziție trebuie să fie un număr pozitiv'),
  salePrice: optionalMaterialNumber('Prețul de vânzare trebuie să fie un număr pozitiv'),
  salePriceMode: z.enum(['amount', 'percent']).default('amount'),
  salePricePercent: optionalMaterialNumber('Procentul de adaos trebuie să fie un număr pozitiv'),
  thickness: optionalMaterialNumber('Thickness must be a non-negative number'),
  density: optionalMaterialNumber('Density must be a non-negative number'),
  wastePercent: optionalMaterialNumber('Waste percent must be between 0 and 100'),

  notes: z.string().optional().or(z.literal('')),
  compatibleMethods: z.array(z.string()).default([]),
  compatibleEquipment: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  const hasPurchasePrice = data.purchasePrice !== undefined && data.purchasePrice !== '';
  const hasSalePrice = data.salePrice !== undefined && data.salePrice !== '';

  if (!hasPurchasePrice && !hasSalePrice) {
    ctx.addIssue({
      code: 'custom',
      message: 'Completează cel puțin un preț (achiziție sau vânzare)',
      path: ['salePrice'],
    });
  }

  if (data.salePriceMode === 'percent') {
    if (!hasPurchasePrice) {
      ctx.addIssue({
        code: 'custom',
        message: 'Prețul de achiziție este obligatoriu pentru modul procent',
        path: ['purchasePrice'],
      });
    }

    if (data.salePricePercent === undefined || data.salePricePercent === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Procentul de adaos este obligatoriu pentru modul procent',
        path: ['salePricePercent'],
      });
    }
  }

  if (data.consumptionType === 'DIRECT' && !hasSalePrice && !hasPurchasePrice) {
    ctx.addIssue({
      code: 'custom',
      message: 'Consumabilele directe trebuie să aibă preț configurat',
      path: ['salePrice'],
    });
  }

  if (data.wastePercent !== undefined && data.wastePercent !== '') {
    const wastePercent = Number(data.wastePercent);

    if (wastePercent < 0 || wastePercent > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'Waste percent must be between 0 and 100',
        path: ['wastePercent'],
      });
    }
  }

  // Note: Dynamic field validation based on category flags will be handled
  // by the CategoryTreeSelector in MaterialForm
});

export type MaterialFormData = z.infer<typeof materialFormSchema>;

// ==================== Machine Schema ====================
const optionalDecimal = () => z.number().min(0).optional().nullable();
const optionalInt    = () => z.number().int().min(0).optional().nullable();

export const machineFormSchema = z.object({
  name: z.string()
    .min(1, 'Numele echipamentului este obligatoriu')
    .min(2, 'Minim 2 caractere')
    .max(100, 'Maxim 100 caractere'),

  type: z.string().min(1, 'Tipul este obligatoriu'),

  equipmentType: z.enum(['LARGE_FORMAT', 'DIGITAL', 'HOURLY']).default('HOURLY'),

  status: z.enum(['AVAILABLE', 'BUSY', 'MAINTENANCE'], { message: 'Status invalid' }),

  // Comune
  speed: z.string().optional().or(z.literal('')),
  maxWidth:  optionalInt(),
  maxHeight: optionalInt(),
  operatorCostPerHour: optionalDecimal(),
  energyConsumptionKw: optionalDecimal(),

  // Large Format
  costPerHour:      optionalDecimal(), // folosit și la Hourly
  speedM2PerHour:   optionalDecimal(),
  inkPerM2:         optionalDecimal(),
  materialPerM2:    optionalDecimal(),
  headAmortPerM2:   optionalDecimal(),
  printerAmortPerM2: optionalDecimal(),
  maintCostPerM2:   optionalDecimal(),

  // Digital
  costClickColor: optionalDecimal(),
  costClickBW:    optionalDecimal(),
  servicePerClick: optionalDecimal(),
  maxFormat:       z.string().optional().nullable(),
  maxGramWeight:   optionalInt(),
  speedPpm:        optionalInt(),

  compatibleMaterialIds:    z.array(z.string()).default([]),
  compatiblePrintMethodIds: z.array(z.string()).default([]),

  description:     z.string().optional().or(z.literal('')),
  notes:           z.string().optional().or(z.literal('')),
  lastMaintenance: z.string().optional().nullable(),
  active:          z.boolean().default(true),
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
  name: z.string()
    .min(1, 'Numele jobului este obligatoriu')
    .min(3, 'Numele trebuie să aibă cel puțin 3 caractere')
    .max(200, 'Numele nu poate depăși 200 de caractere'),
  
  orderId: z.string()
    .min(1, 'Comanda este obligatorie'),

  productId: z.string().optional().or(z.literal('')),
  
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    message: 'Status invalid',
  }),

  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().or(z.literal('')),
  
  assignedTo: z.string().optional().or(z.literal('')),

  printMethodId: z.string().optional().or(z.literal('')),

  materialId: z.string().optional().or(z.literal('')),

  machineId: z.string().optional().or(z.literal('')),

  quantity: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive('Cantitatea trebuie să fie pozitivă').optional(),
  ),

  bwPages: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().nonnegative('Paginile alb-negru nu pot fi negative').optional(),
  ),
  
  deadline: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return !isNaN(Date.parse(val));
    }, {
      message: 'Dată invalidă',
    }),
  
  notes: z.string().optional().or(z.literal('')),
});

export type JobFormData = z.infer<typeof jobFormSchema>;

// ==================== System Settings Schema ====================
export const systemSettingsFormSchema = z.object({
  company_name: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  
  company_email: z.string()
    .email('Invalid email format')
    .min(1, 'Company email is required'),
  
  default_currency: z.string()
    .min(1, 'Currency is required'),
  
  timezone: z.string()
    .min(1, 'Timezone is required'),
  
  low_stock_threshold: z.string()
    .min(1, 'Low stock threshold is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Low stock threshold must be a non-negative number',
    }),
});

export type SystemSettingsFormData = z.infer<typeof systemSettingsFormSchema>;

// ==================== Production Search Schema ====================
export const productionSearchFormSchema = z.object({
  search: z.string().optional().or(z.literal('')),
  priority: z.string().optional().or(z.literal('')),
});

export type ProductionSearchFormData = z.infer<typeof productionSearchFormSchema>;

// ==================== Material Consumption Schema ====================
export const materialConsumptionFormSchema = z.object({
  jobId: z.string().min(1, 'Selectează un job de producție'),
  quantity: z.number().positive('Cantitatea trebuie să fie pozitivă'),
  unit: z.enum(['liter', 'ml', 'gram', 'kg', 'unit', 'm2', 'meter', 'pcs']).optional(),
  rollWidthMeters: z.number().positive('Lățimea rolei trebuie să fie pozitivă').optional(),
});

export type MaterialConsumptionFormData = z.infer<typeof materialConsumptionFormSchema>;
