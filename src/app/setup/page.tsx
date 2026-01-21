"use client";

import { useState, useEffect } from "react";
import { LoadingState } from '@/components/ui';
import { useRouter } from "next/navigation";
import { Card, Input, Button } from "@/components/ui";

export default function SetupPage() {
  const [email, setEmail] = useState("admin@sanduta.art");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Administrator");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/setup');
      const data = await response.json();
      
      if (data.needsSetup) {
        setNeedsSetup(true);
      } else {
        // Admin already exists, redirect to login
        router.push('/login');
      }
    } catch (err) {
      console.error('Setup check error:', err);
      setError('Nu s-a putut verifica statusul setup-ului');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'A apărut o eroare');
        setLoading(false);
        return;
      }

      // Success! Redirect to login
      alert('✅ Utilizator admin creat cu succes! Acum te poți autentifica.');
      router.push('/login');
    } catch (err) {
      console.error('Setup error:', err);
      setError('A apărut o eroare la crearea adminului');
      setLoading(false);
    }
  };

  if (checking) {
    return <LoadingState text="Verificare status..." />;
  }

  if (!needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Setup deja completat</h2>
            <p className="text-gray-600 mb-4">Administratorul a fost deja creat.</p>
            <Button onClick={() => router.push('/login')}>
              Mergi la Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 Setup Inițial
            </h1>
            <p className="text-gray-600">
              Creează primul utilizator administrator
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              ℹ️ Această pagină va fi accesibilă doar până când primul admin este creat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Nume"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Administrator"
              required
            />
            
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sanduta.art"
              required
            />
            
            <Input
              type="password"
              label="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minim 6 caractere"
              required
              minLength={6}
            />

            <Button type="submit" fullWidth loading={loading}>
              Creează Administrator
            </Button>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-xs">
              💡 <strong>Sfat:</strong> Salvează credențialele într-un loc sigur!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
