"use client";

import { useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { resetPasswordSchema, type ResetPasswordFormData, getPasswordStrength } from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setGeneralError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: data.email, 
          newPassword: data.newPassword 
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setGeneralError(responseData.error || 'A apărut o eroare');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Reset error:', err);
      setGeneralError('A apărut o eroare la resetarea parolei');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resetare Parolă</h1>
          <p className="text-gray-600 dark:text-gray-400">Resetează parola pentru contul tău</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-300 text-sm">{generalError}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-green-600 dark:text-green-300 text-sm">
                ✅ Parola a fost resetată cu succes! Redirectare către login...
              </p>
            </div>
          )}

          <Form<ResetPasswordFormData>
            schema={resetPasswordSchema}
            onSubmit={handleSubmit}
            defaultValues={{ email: 'admin@sanduta.art', newPassword: '', confirmPassword: '' }}
            className="space-y-4"
          >
            <FormField<ResetPasswordFormData> name="email">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="email" required>Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={error}
                    placeholder="admin@sanduta.art"
                    disabled={success}
                  />
                  <FormMessage error={error} />
                </div>
              )}
            </FormField>

            <FormField<ResetPasswordFormData> name="newPassword">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="newPassword" required>Parolă Nouă</FormLabel>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => { onChange(e); setPasswordValue(e.target.value); }}
                    onBlur={onBlur}
                    error={error}
                    placeholder="Minim 8 caractere"
                    disabled={success}
                  />
                  <FormMessage error={error} />
                  {passwordValue && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 4) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </FormField>

            <FormField<ResetPasswordFormData> name="confirmPassword">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="confirmPassword" required>Confirmă Parola</FormLabel>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={error}
                    placeholder="Reintroduceți parola"
                    disabled={success}
                  />
                  <FormMessage error={error} />
                </div>
              )}
            </FormField>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={success}
              className="h-12"
            >
              {loading ? 'Se procesează...' : success ? 'Resetare reușită!' : 'Resetează Parola'}
            </Button>
          </Form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Înapoi la Login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2026 Sanduta.art. Toate drepturile rezervate.</p>
        </div>
      </div>
    </div>
  );
}
