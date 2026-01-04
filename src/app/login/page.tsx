"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Input, Button } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // Redirect authenticated users based on their role
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role;
      console.log(`[Login] User authenticated with role: ${role}`);
      
      // Use router.push for smooth client-side navigation
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "MANAGER") {
        router.push("/manager/orders");
      } else {
        router.push("/");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log(`[Login] Attempting sign in for: ${email}`);
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log(`[Login] Sign in result:`, result);

      if (result?.error) {
        console.error(`[Login] Sign in failed:`, result.error);
        setError("Email sau parolă incorectă");
        setLoading(false);
      } else if (result?.ok) {
        console.log(`[Login] Sign in successful, updating session...`);
        // Force session update to get the latest data with role
        await update();
        // The useEffect will handle the redirect after session is updated
      }
    } catch (err) {
      console.error('[Login] Sign in error:', err);
      setError("A apărut o eroare. Încearcă din nou.");
      setLoading(false);
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