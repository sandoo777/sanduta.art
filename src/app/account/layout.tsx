'use client';

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
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

  // Middleware handles redirect, just show unauthorized here
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to access your account.</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/account', label: 'Dashboard', icon: '🏠' },
    { href: '/account/orders', label: 'My Orders', icon: '📦' },
    { href: '/account/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <div className="text-sm text-gray-500">My Account</div>
            <div className="font-medium text-gray-900">{session.user.name}</div>
            <div className="text-xs text-gray-500">{session.user.email}</div>
          </div>
          
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AccountRootLayout({ children }: { children: ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
