'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { PanelHeader, PanelSidebar, SidebarItem } from "@/components/common";

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Redirect in progress, show loading
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  const navItems: SidebarItem[] = [
    { href: '/account', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/account/orders', label: 'Comenzile Mele', icon: 'Package' },
    { href: '/account/profile', label: 'Profil', icon: 'User' },
    { href: '/account/settings', label: 'Setări', icon: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PanelHeader />
      
      <div className="flex">
        <PanelSidebar
          title="My Account"
          userInfo={{
            name: session.user.name,
            email: session.user.email,
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

export default function AccountRootLayout({ children }: { children: ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
