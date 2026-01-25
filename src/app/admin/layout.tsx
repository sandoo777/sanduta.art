'use client';

import { useState } from 'react';
import { LoadingState } from '@/components/ui/LoadingState';
import { useSession } from 'next-auth/react';
import { AdminSidebar } from './_components/AdminSidebar';
import { AdminTopbar } from './_components/AdminTopbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useSession();

  // Show loading state
  if (status === 'loading') {
    return <LoadingState text="Loading..." />;
  }

  // Middleware handles authentication and authorization
  // If user reaches here, they are authenticated and authorized

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
