"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Button } from "@/components/ui";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("admin@sanduta.art");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Parolele nu corespund");
      return;
    }

    if (newPassword.length < 6) {
      setError("Parola trebuie să aibă minim 6 caractere");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'A apărut o eroare');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      
      // Use window.location instead of router.push for more reliable redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      console.error('Reset error:', err);
      setError('A apărut o eroare la resetarea parolei');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔑 Resetare Parolă
            </h1>
            <p className="text-gray-600">
              Resetează parola pentru contul tău
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">
                ✅ Parola a fost resetată cu succes! Redirectare către login...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sanduta.art"
              required
              disabled={success}
            />
            
            <Input
              type="password"
              label="Parolă Nouă"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minim 6 caractere"
              required
              minLength={6}
              disabled={success}
            />

            <Input
              type="password"
              label="Confirmă Parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Reintroduceți parola"
              required
              minLength={6}
              disabled={success}
            />

            <Button type="submit" fullWidth loading={loading} disabled={success}>
              {success ? 'Resetare reușită!' : 'Resetează Parola'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Înapoi la Login
            </a>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-xs">
              ⚠️ <strong>Notă:</strong> Această pagină resetează parola pentru orice cont dacă știi email-ul. 
              Pentru securitate, ar trebui să fie accesibilă doar în timpul setup-ului inițial.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
