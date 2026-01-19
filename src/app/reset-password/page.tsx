"use client";

import { useState } from "react";
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("admin@sanduta.art");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
        <div className="bg-white rounded-lg shadow-md p-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sanduta.art"
                required
                disabled={success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parolă Nouă
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minim 6 caractere"
                required
                minLength={6}
                disabled={success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmă Parola
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Reintroduceți parola"
                required
                minLength={6}
                disabled={success}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Se procesează...' : success ? 'Resetare reușită!' : 'Resetează Parola'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Înapoi la Login
            </Link>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-xs">
              ⚠️ <strong>Notă:</strong> Această pagină resetează parola pentru orice cont dacă știi email-ul.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
