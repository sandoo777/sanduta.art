'use client';

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import Link from "next/link";
import { PanelHeader, PanelSidebar, SidebarItem } from "@/components/common";

interface ManagerLayoutProps {
  children: ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
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
  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
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
    { href: '/manager/orders', label: 'Orders', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PanelHeader />
      
      <div className="flex">
        <PanelSidebar
          title="Manager Panel"
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
          
          {/* Link to Admin Panel if user is ADMIN */}
          {session.user.role === 'ADMIN' && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <span className="mr-2">⚙️</span>
                <span>Go to Admin Panel</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
