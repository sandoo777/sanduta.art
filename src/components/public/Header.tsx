'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/products', label: 'Produse' },
    { href: '/about', label: 'Despre noi' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-secondary">
              Sanduta<span className="text-primary">.Art</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
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

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Account link - Desktop */}
            <Link
              href="/account"
              className="hidden items-center space-x-1 text-sm font-medium text-gray-700 transition-colors hover:text-primary md:flex"
            >
              <User className="h-4 w-4" />
              <span>Contul meu</span>
            </Link>

            {/* CTA Button */}
            <Link href="/products" className="hidden md:block">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Comandă acum
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="border-t border-gray-100 py-4 md:hidden">
            <div className="flex flex-col space-y-4">
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
              <Link href="/products" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Comandă acum
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
