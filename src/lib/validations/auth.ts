/**
 * Scheme de validare Zod pentru formulare de autentificare
 */

import { z } from 'zod';

/**
 * Schema pentru Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email-ul este obligatoriu')
    .email('Adresa de email nu este validă'),
  password: z
    .string()
    .min(1, 'Parola este obligatorie')
    .min(6, 'Parola trebuie să aibă minim 6 caractere'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema pentru Register
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Numele este obligatoriu')
      .min(2, 'Numele trebuie să aibă minim 2 caractere')
      .max(50, 'Numele este prea lung'),
    email: z
      .string()
      .min(1, 'Email-ul este obligatoriu')
      .email('Adresa de email nu este validă'),
    password: z
      .string()
      .min(1, 'Parola este obligatorie')
      .min(8, 'Parola trebuie să aibă minim 8 caractere')
      .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
      .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră'),
    confirmPassword: z.string().min(1, 'Confirmarea parolei este obligatorie'),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Trebuie să accepți Termenii și condițiile',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parolele nu coincid',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema pentru Forgot Password
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email-ul este obligatoriu')
    .email('Adresa de email nu este validă'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Schema pentru Reset Password
 */
export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email-ul este obligatoriu')
      .email('Adresa de email nu este validă'),
    newPassword: z
      .string()
      .min(1, 'Parola nouă este obligatorie')
      .min(8, 'Parola trebuie să aibă minim 8 caractere')
      .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
      .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmarea parolei este obligatorie'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Parolele nu coincid',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Helper pentru calculul puterii parolei
 */
export function getPasswordStrength(password: string): {
  strength: number;
  label: string;
  color: string;
} {
  if (!password) return { strength: 0, label: '', color: '' };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 1)
    return { strength, label: 'Slabă', color: 'bg-red-500' };
  if (strength === 2)
    return { strength, label: 'Medie', color: 'bg-yellow-500' };
  if (strength === 3) return { strength, label: 'Bună', color: 'bg-blue-500' };
  return { strength, label: 'Excelentă', color: 'bg-green-500' };
}
