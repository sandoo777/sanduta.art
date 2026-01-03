"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.email !== 'admin@example.com') { // Example admin check
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.email !== 'admin@example.com') {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <p>Welcome, {session.user.name}!</p>
      {/* Add admin functionality here */}
    </div>
  );
}