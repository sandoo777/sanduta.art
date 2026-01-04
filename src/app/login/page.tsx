"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Input, Button } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email sau parolă incorectă");
    } else {
      // Fetch session to get user role
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      // Redirect based on role
      if (session?.user?.role === 'ADMIN') {
        router.push("/admin");
      } else if (session?.user?.role === 'MANAGER') {
        router.push("/manager/orders");
      } else {
        router.push("/");
      }
      
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Вход</h1>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading}>
              Войти
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Nu ai cont?{" "}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Înregistrează-te
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}