'use client';

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Middleware should handle redirect, just show unauthorized here
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { href: '/admin/pages', label: 'Pages', icon: '📄' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
  ];

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">Management Dashboard</p>
          </div>
          <nav className="px-4 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
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
