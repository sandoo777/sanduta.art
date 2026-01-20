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

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Middleware handles redirect, just show unauthorized here
  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">You don&apos;t have permission to access the manager panel.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const navItems: SidebarItem[] = [
    { href: '/manager', label: 'Dashboard', icon: '📊' },
    { href: '/manager/orders', label: 'Orders', icon: '📦' },
    { href: '/manager/customers', label: 'Customers', icon: '👥' },
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
        </main>
      </div>
    </div>
  );
}

export default function ManagerRootLayout({ children }: { children: ReactNode }) {
  return <ManagerLayout>{children}</ManagerLayout>;
}
