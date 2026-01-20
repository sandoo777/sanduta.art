'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export interface SidebarItem {
  href: string;
  label: string;
  icon: string | ReactNode;
}

interface PanelSidebarProps {
  title: string;
  userInfo?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  navItems: SidebarItem[];
  className?: string;
}

/**
 * PanelSidebar - Sidebar unificat pentru panel-urile user/manager/operator
 * Caracteristici:
 * - Afișare informații user
 * - Navigație cu highlight pe pagina activă
 * - Icoane pentru fiecare secțiune
 * - Design consistent
 */
export function PanelSidebar({ title, userInfo, navItems, className = '' }: PanelSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 min-h-screen ${className}`}>
      {/* User Info Header */}
      {userInfo && (
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm text-gray-500">{title}</div>
          {userInfo.name && (
            <div className="font-medium text-gray-900 truncate">{userInfo.name}</div>
          )}
          {userInfo.email && (
            <div className="text-xs text-gray-500 truncate">{userInfo.email}</div>
          )}
          {userInfo.role && (
            <div className="text-xs text-gray-500 uppercase">{userInfo.role}</div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">
                {typeof item.icon === 'string' ? item.icon : item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
