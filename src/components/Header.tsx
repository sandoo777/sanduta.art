'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600">
              Sanduta Art
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">Главная</Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition">Продукты</Link>
            <Link href="/checkout" className="text-gray-700 hover:text-blue-600 transition">Корзина</Link>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition">О нас</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Контакты</a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop Search */}
            <form action="/products" method="GET" className="hidden lg:flex">
              <input
                type="text"
                name="search"
                placeholder="Поиск..."
                className="px-3 py-1 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Cart Icon */}
            <Link href="/checkout" className="text-gray-700 hover:text-blue-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
              </svg>
            </Link>
            
            {/* User Account Dropdown */}
            {session ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-600 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Мои заказы
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex text-gray-700 hover:text-blue-600 transition items-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-blue-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            {/* Mobile Search */}
            <form action="/products" method="GET" className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  name="search"
                  placeholder="Поиск..."
                  className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Главная
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Продукты
              </Link>
              <Link 
                href="/checkout" 
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Корзина
              </Link>
              <a 
                href="#about" 
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                О нас
              </a>
              <a 
                href="#contact" 
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Контакты
              </a>

              {/* Mobile User Section */}
              {session ? (
                <>
                  <div className="border-t pt-3 mt-2">
                    <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-600">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/account/orders"
                    className="text-gray-700 hover:text-blue-600 transition py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Мои заказы
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-left text-red-600 hover:text-red-700 transition py-2"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Войти
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
