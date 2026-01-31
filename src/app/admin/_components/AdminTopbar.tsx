'use client';

import { Menu, LogOut, User, ChevronDown, ExternalLink } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useCurrentUser } from '@/modules/auth/useCurrentUser';
import { useState, useEffect } from 'react';
import { AuthLink } from '@/components/common/links/AuthLink';
import { Badge } from '@/components/ui/Badge';
import { CategoriesDropdown } from './CategoriesDropdown';
import { buildCategoryTree } from '@/lib/categoryTree';
import { Category } from '@/types/models';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user } = useCurrentUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Build category tree
  const categoryTree = buildCategoryTree(categories);

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left side - Categories dropdown + Menu button + Logo */}
        <div className="flex items-center gap-3">
          {/* Categories Dropdown - Always visible */}
          {!loading && categoryTree.length > 0 && (
            <CategoriesDropdown categories={categoryTree} />
          )}

          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-4">
          {/* View Site Button */}
          <AuthLink 
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Vezi site-ul</span>
          </AuthLink>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {user?.role || 'ADMIN'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.email}
                    </p>
                    <Badge variant="info" size="sm" className="mt-2">
                      {user?.role || 'ADMIN'}
                    </Badge>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
