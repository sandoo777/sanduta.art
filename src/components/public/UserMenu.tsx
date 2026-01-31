'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { User, Settings, LogOut, ShieldCheck } from 'lucide-react';

/**
 * UserMenu - User profile dropdown menu
 * Features:
 * - User avatar with initials
 * - Dropdown with profile, settings, logout
 * - Admin link (if user is admin)
 * - Click outside to close
 */
export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 transition-colors hover:text-primary"
      >
        <User className="h-4 w-4" />
        <span>Login</span>
      </Link>
    );
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <UserAvatar name={session.user.name || session.user.email} size="md" />
        <span className="hidden text-sm font-medium text-gray-700 md:block">
          {session.user.name?.split(' ')[0] || 'Profile'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/account"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-3 h-4 w-4" />
                Profilul meu
              </Link>

              <Link
                href="/account/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Setări
              </Link>

              {isAdmin && (
                <>
                  <div className="my-1 border-t border-gray-100"></div>
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm text-primary hover:bg-blue-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheck className="mr-3 h-4 w-4" />
                    Admin Panel
                  </Link>
                </>
              )}

              <div className="my-1 border-t border-gray-100"></div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
