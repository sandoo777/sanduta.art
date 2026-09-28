"use client";

import { useState } from "react";
import Link from 'next/link';
import { Input, Button } from "@/components/ui";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setGeneralError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setGeneralError(responseData.error || 'A apărut o eroare');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setGeneralError('Nu s-a putut conecta la server. Verifică conexiunea internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-3 sm:mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Ai uitat parola?</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Introdu emailul tău pentru a primi instrucțiuni de resetare
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-100/50 dark:shadow-gray-900/50 p-6 sm:p-8 backdrop-blur-sm border border-gray-100 dark:border-gray-700 animate-slide-up">
          {generalError && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl animate-shake">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">{generalError}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl animate-success">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium">
                  Email trimis cu succes! Verifică-ți inbox-ul pentru instrucțiuni.
                </p>
              </div>
            </div>
          )}
          
          <Form<ForgotPasswordFormData>
            schema={forgotPasswordSchema}
            onSubmit={handleSubmit}
            defaultValues={{ email: '' }}
            className="space-y-4 sm:space-y-5"
          >
            <FormField<ForgotPasswordFormData> name="email">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="email" required>
                    Adresa de email
                  </FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={error}
                    placeholder="exemplu@email.com"
                    disabled={success}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    }
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
              className="h-11 sm:h-12 text-sm sm:text-base font-semibold"
            >
              {loading ? 'Se trimite...' : success ? 'Email trimis!' : 'Trimite instrucțiuni'}
            </Button>
          </Form>

          <div className="mt-6 sm:mt-8 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-all hover:underline hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Înapoi la autentificare
            </Link>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 Sanduta.art. Toate drepturile rezervate.</p>
        </div>
      </div>
    </div>
  );
}
