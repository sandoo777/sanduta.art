'use client';

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import Link from "next/link";
import { PanelHeader, PanelSidebar, SidebarItem } from "@/components/common";

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
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const navItems: SidebarItem[] = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { href: '/admin/pages', label: 'Pages', icon: '📄' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PanelHeader />
      
      <div className="flex">
        <PanelSidebar
          title="Admin Panel"
          userInfo={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
          navItems={navItems}
        />

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
