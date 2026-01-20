import { z } from 'zod';

// ========================================
// Profile Form Schema
// ========================================

export const profileSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să conțină minim 2 caractere'),
  email: z.string().email('Email invalid'),
  phone: z.string().optional(),
  company: z.string().optional(),
  cui: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ========================================
// Change Password Schema
// ========================================

const passwordValidation = z
  .string()
  .min(8, 'Parola trebuie să conțină minim 8 caractere')
  .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
  .regex(/[a-z]/, 'Parola trebuie să conțină cel puțin o literă mică')
  .regex(/\d/, 'Parola trebuie să conțină cel puțin o cifră')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Parola trebuie să conțină cel puțin un simbol special');

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Parola actuală este obligatorie'),
  newPassword: passwordValidation,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Parolele nu se potrivesc',
  path: ['confirmPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ========================================
// Address Form Schema
// ========================================

export const addressSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să conțină minim 2 caractere'),
  phone: z.string().min(6, 'Numărul de telefon este invalid'),
  address: z.string().min(5, 'Adresa trebuie să conțină minim 5 caractere'),
  city: z.string().min(2, 'Orașul trebuie să conțină minim 2 caractere'),
  country: z.string().min(2, 'Țara trebuie să conțină minim 2 caractere'),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// ========================================
// Communication Preferences Schema
// ========================================

export const communicationPreferencesSchema = z.object({
  newsletter: z.boolean().default(false),
  specialOffers: z.boolean().default(false),
  personalizedRecommend: z.boolean().default(false),
  productNews: z.boolean().default(false),
});

export type CommunicationPreferencesFormData = z.infer<typeof communicationPreferencesSchema>;

// ========================================
// Password Strength Helper
// ========================================

export function getPasswordStrengthDetails(password: string) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  
  let strength = 0;
  let label = '';
  let color = '';

  if (passed === 5) {
    strength = 4;
    label = 'Foarte puternică';
    color = 'bg-green-500';
  } else if (passed === 4) {
    strength = 3;
    label = 'Puternică';
    color = 'bg-blue-500';
  } else if (passed === 3) {
    strength = 2;
    label = 'Medie';
    color = 'bg-yellow-500';
  } else {
    strength = 1;
    label = 'Slabă';
    color = 'bg-red-500';
  }

  return { strength, label, color, checks };
}
