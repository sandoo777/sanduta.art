"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Form, FormField, FormLabel, FormMessage, Input, Button } from "@/components/ui";
import { registerSchema, type RegisterFormData, getPasswordStrength } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (data: RegisterFormData) => {
    setGeneralError("");
    setLoading(true);

    try {
      console.log(\`[Register] Creating account for: \${data.email}\`);
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: data.name,
          email: data.email,
          password: data.password 
        }),
      });

      const responseData = await res.json();
      console.log(\`[Register] API response:\`, { status: res.status, ok: res.ok });

      if (res.ok) {
        console.log(\`[Register] Account created successfully, redirecting to login\`);
        router.push("/login?registered=true");
      } else {
        console.error(\`[Register] Registration failed:\`, responseData);
        
        if (res.status === 400) {
          if (responseData.message?.includes('already exists')) {
            setGeneralError("Un cont cu acest email există deja. Te poți autentifica.");
          } else if (responseData.message?.includes('required')) {
            setGeneralError("Toate câmpurile sunt obligatorii");
          } else {
            setGeneralError(responseData.message || "Înregistrarea a eșuat");
          }
        } else if (res.status === 500) {
          setGeneralError("Înregistrarea a eșuat. Te rugăm să încerci mai târziu.");
        } else {
          setGeneralError(responseData.message || "A apărut o eroare neașteptată");
        }
      }
    } catch (err) {
      console.error('[Register] Network error:', err);
      setGeneralError("Nu s-a putut conecta la server. Verifică conexiunea internet.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-3 sm:mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Creează cont nou</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Începe să creezi astăzi</p>
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
          
          <Form<RegisterFormData>
            schema={registerSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              acceptTerms: false,
            }}
            className="space-y-4"
          >
            <FormField<RegisterFormData> name="name">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="name" required>Nume complet</FormLabel>
                  <Input id="name" type="text" value={value} onChange={onChange} onBlur={onBlur} error={error} placeholder="Ion Popescu" />
                  <FormMessage error={error} />
                </div>
              )}
            </FormField>

            <FormField<RegisterFormData> name="email">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="email" required>Adresa de email</FormLabel>
                  <Input id="email" type="email" value={value} onChange={onChange} onBlur={onBlur} error={error} placeholder="exemplu@email.com" />
                  <FormMessage error={error} />
                </div>
              )}
            </FormField>

            <FormField<RegisterFormData> name="password">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="password" required>Parola</FormLabel>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => { onChange(e); setPasswordValue(e.target.value); }}
                    onBlur={onBlur}
                    error={error}
                    placeholder="Minim 8 caractere"
                  />
                  <FormMessage error={error} />
                  {passwordValue && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={\`h-full transition-all \${passwordStrength.color}\`} style={{ width: \`\${(passwordStrength.strength / 4) * 100}%\` }} />
                        </div>
                        <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </FormField>

            <FormField<RegisterFormData> name="confirmPassword">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="confirmPassword" required>Confirmă parola</FormLabel>
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={value} onChange={onChange} onBlur={onBlur} error={error} placeholder="Reintroduceți parola" />
                  <FormMessage error={error} />
                </div>
              )}
            </FormField>

            <FormField<RegisterFormData> name="acceptTerms">
              {({ value, onChange, error }) => (
                <div>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" checked={value} onChange={onChange} className="mt-0.5 w-4 h-4 rounded" />
                    <span className="text-sm">Accept <Link href="/terms" className="text-blue-600 underline">Termenii și condițiile</Link></span>
                  </label>
                  <FormMessage error={error} />
                </div>
              )}
            </FormField>

            <Button type="submit" fullWidth loading={loading} className="h-11">
              {loading ? 'Se creează contul...' : 'Creează cont'}
            </Button>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ai deja cont? <Link href="/login" className="text-blue-600 font-semibold">Autentifică-te</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2026 Sanduta.art. Toate drepturile rezervate.</p>
        </div>
      </div>
    </div>
  );
}
