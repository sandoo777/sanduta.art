'use client';

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Role } from "@/lib/types-prisma";

interface ManagerLayoutProps {
  children: ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user.role !== Role.MANAGER && session.user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session || (session.user.role !== Role.MANAGER && session.user.role !== Role.ADMIN)) {
    return null;
  }

  const navItems = [
    { href: '/manager/orders', label: 'Orders', icon: '📦' },
  ];

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">Manager Panel</h2>
            <p className="text-sm text-gray-600 mt-1">Order Management</p>
          </div>
          <nav className="px-4 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition ${
                  pathname === item.href
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            {session.user.role === Role.ADMIN && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 mb-2 rounded-lg text-gray-700 hover:bg-gray-100 transition border-t mt-4 pt-4"
              >
                <span className="mr-3 text-xl">⚙️</span>
                <span className="font-medium">Admin Panel</span>
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
