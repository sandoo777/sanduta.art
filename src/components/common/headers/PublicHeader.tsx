'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/modules/cart/cartStore';
import { useSession } from 'next-auth/react';
import NotificationsDropdown from '@/components/account/notifications/NotificationsDropdown';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { MobileCategoriesMenu } from '@/components/public/navigation/MobileCategoriesMenu';
import { UserMenu } from '@/components/public/UserMenu';
import { PublicCategoriesDropdown } from '@/components/public/navigation/PublicCategoriesDropdown';
import { buildCategoryTree, CategoryTreeNode } from '@/lib/categoryTree';
import type { Category } from '@prisma/client';

/**
 * PublicHeader - Header pentru paginile publice ale site-ului
 * Caracteristici:
 * - Logo și branding
 * - Navigație mega menu cu categorii
 * - Coș de cumpărături cu counter
 * - Language switcher
 * - Notificări (pentru useri autentificați)
 * - Responsive mobile menu
 */
export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { getTotals } = useCartStore();
  const cartItemCount = getTotals().itemCount;
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryTree = buildCategoryTree(categories);

  const navLinks = [
    { href: '/produse', label: 'Produse' },
    { href: '/about', label: 'Despre noi' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {/* TopBar - Logo, Search, Actions */}
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Categories dropdown + Logo */}
            <div className="flex items-center gap-3">
              {/* Categories Dropdown (Hamburger) */}
              {!loadingCategories && categoryTree.length > 0 && (
                <PublicCategoriesDropdown categories={categoryTree} />
              )}
              
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-secondary">
                Sanduta<span className="text-primary">.Art</span>
              </span>
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher variant="compact" />

              {/* Notifications dropdown - only for authenticated users */}
              {session && <NotificationsDropdown />}

              {/* Cart link */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 transition-colors hover:text-primary hover:bg-gray-100 rounded-lg"
                aria-label={`Coș de cumpărături (${cartItemCount} produse)`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu with Avatar and Dropdown */}
              <div className="hidden md:block">
                <UserMenu />
              </div>

              {/* CTA Button */}
              <Link href="/produse" className="hidden md:block">
                <Button>
                  Explorează produsele
                </Button>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NavBar - Main Navigation (Desktop only) */}
      <div className="hidden md:block bg-gray-50/50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-12 items-center justify-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation (unchanged) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="border-t border-gray-100 py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/cart"
                className="flex items-center justify-between text-base font-medium text-gray-700 transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Coș de cumpărături</span>
                </div>
                {cartItemCount > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              {/* Mobile Categories Menu */}
              <MobileCategoriesMenu onLinkClick={() => setIsMenuOpen(false)} />
              
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-gray-700 transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                className="flex items-center space-x-2 text-base font-medium text-gray-700 transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Contul meu</span>
              </Link>
              <Link href="/produse" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">
                  Explorează produsele
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
