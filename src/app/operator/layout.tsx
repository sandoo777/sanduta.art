'use client';

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { PanelHeader, PanelSidebar, SidebarItem } from "@/components/common";

interface OperatorLayoutProps {
  children: ReactNode;
}

export function OperatorLayout({ children }: OperatorLayoutProps) {
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
  if (!session || (session.user.role !== 'OPERATOR' && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">You don&apos;t have permission to access the operator panel.</p>
          <AuthLink href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go to Homepage
          </AuthLink>
        </div>
      </div>
    );
  }

  const navItems: SidebarItem[] = [
    { href: '/operator', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/operator/production', label: 'Coadă Producție', icon: 'Settings' },
    { href: '/operator/jobs', label: 'Sarcinile Mele', icon: 'ClipboardList' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PanelHeader />
      
      <div className="flex">
        <PanelSidebar
          title="Operator Panel"
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

export default function OperatorRootLayout({ children }: { children: ReactNode }) {
  return <OperatorLayout>{children}</OperatorLayout>;
}
