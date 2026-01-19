"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Input, Button } from "@/components/ui";

// Validation helpers
const validateName = (name: string): string | null => {
  if (!name) return null;
  if (name.length < 2) return "Numele trebuie să aibă minim 2 caractere";
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : "Adresa de email nu este validă";
};

const validatePassword = (password: string): string | null => {
  if (!password) return null;
  if (password.length < 8) return "Parola trebuie să aibă minim 8 caractere";
  if (!/[A-Z]/.test(password)) return "Parola trebuie să conțină cel puțin o literă mare";
  if (!/[0-9]/.test(password)) return "Parola trebuie să conțină cel puțin o cifră";
  return null;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });
  
  const router = useRouter();

  // Real-time validation
  useEffect(() => {
    if (touched.name) setNameError(validateName(name));
  }, [name, touched.name]);

  useEffect(() => {
    if (touched.email) setEmailError(validateEmail(email));
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.password) setPasswordError(validatePassword(password));
  }, [password, touched.password]);

  useEffect(() => {
    if (touched.confirmPassword) {
      if (!confirmPassword) {
        setConfirmPasswordError(null);
      } else if (password !== confirmPassword) {
        setConfirmPasswordError("Parolele nu coincid");
      } else {
        setConfirmPasswordError(null);
      }
    }
  }, [confirmPassword, password, touched.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    
    // Validate
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = password !== confirmPassword ? "Parolele nu coincid" : null;
    
    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);
    
    if (nameErr || emailErr || passwordErr || confirmErr) {
      setGeneralError("Te rugăm să corectezi erorile de mai sus");
      return;
    }
    
    if (!acceptTerms) {
      setGeneralError("Trebuie să accepți Termenii și condițiile");
      return;
    }
    
    setGeneralError("");
    setLoading(true);

    try {
      console.log(`[Register] Creating account for: ${email}`);
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      console.log(`[Register] API response:`, { status: res.status, ok: res.ok });

      if (res.ok) {
        console.log(`[Register] Account created successfully, redirecting to login`);
        // Success - redirect to login with success message
        router.push("/login?registered=true");
      } else {
        console.error(`[Register] Registration failed:`, data);
        
        // Handle specific API errors with user-friendly messages
        if (res.status === 400) {
          if (data.message?.includes('already exists')) {
            setEmailError("Acest email este deja înregistrat");
            setGeneralError("Un cont cu acest email există deja. Te poți autentifica.");
          } else if (data.message?.includes('required')) {
            setGeneralError("Toate câmpurile sunt obligatorii");
          } else if (data.message?.includes('Password')) {
            setPasswordError(data.message);
            setGeneralError("Parola nu îndeplinește cerințele");
          } else {
            setGeneralError(data.message || "Înregistrarea a eșuat");
          }
        } else if (res.status === 500) {
          setGeneralError("Înregistrarea a eșuat. Te rugăm să încerci mai târziu.");
        } else {
          setGeneralError(data.message || "A apărut o eroare neașteptată");
        }
      }
    } catch (err) {
      console.error('[Register] Network error:', err);
      setGeneralError("Nu s-a putut conecta la server. Verifică conexiunea internet.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name && email && password && confirmPassword && password === confirmPassword && acceptTerms && !nameError && !emailError && !passwordError && !confirmPasswordError;

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return { strength, label: "Slabă", color: "bg-red-500" };
    if (strength === 2) return { strength, label: "Medie", color: "bg-yellow-500" };
    if (strength === 3) return { strength, label: "Bună", color: "bg-blue-500" };
    return { strength, label: "Excelentă", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-3 sm:mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Creează cont nou</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Începe să creezi astăzi</p>
        </div>

        {/* Card */}
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
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">{/* Name Input */}
            <Input
              type="text"
              label="Nume complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched({ ...touched, name: true })}
              error={touched.name ? nameError || undefined : undefined}
              required
              placeholder="Ion Popescu"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            {/* Email Input */}
            <Input
              type="email"
              label="Adresa de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              error={touched.email ? emailError || undefined : undefined}
              required
              placeholder="exemplu@email.com"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            {/* Password Input */}
            <div>
              <Input
                type={showPassword ? "text" : "password"}
                label="Parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                error={touched.password ? passwordError || undefined : undefined}
                required
                placeholder="••••••••"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Forța parolei:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength <= 1 ? 'text-red-600 dark:text-red-400' :
                      passwordStrength.strength === 2 ? 'text-yellow-600 dark:text-yellow-400' :
                      passwordStrength.strength === 3 ? 'text-blue-600 dark:text-blue-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <Input
              type={showConfirmPassword ? "text" : "password"}
              label="Confirmă parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              error={touched.confirmPassword ? confirmPasswordError || undefined : undefined}
              required
              placeholder="••••••••"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required 
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer transition-transform hover:scale-110" 
              />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Sunt de acord cu{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline inline-block hover:scale-105 transition-all">
                  Termenii și condițiile
                </Link>
                {" "}și{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline inline-block hover:scale-105 transition-all">
                  Politica de confidențialitate
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              disabled={!isFormValid}
              className="h-11 sm:h-12 text-sm sm:text-base font-semibold"
            >
              {loading ? 'Se creează contul...' : 'Creează cont'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">sau</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Ai deja cont?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-all hover:underline inline-block hover:scale-105">
                Conectează-te
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 Sanduta.art. Toate drepturile rezervate.</p>
        </div>
      </div>
    </div>
  );
}