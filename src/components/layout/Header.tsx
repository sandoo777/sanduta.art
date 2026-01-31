'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/types-prisma";
import { UserAvatar } from "@/components/ui/UserAvatar";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Menu Button */}
          <div className="flex items-center" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 transition p-2"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-16 left-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-50">
                <Link
                  href="/"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Catalog
                </Link>
                <a
                  href="#contact"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
                <a
                  href="#about"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
              </div>
            )}
          </div>

          {/* Center Section - Brand Title */}
          <div className="flex-1 flex justify-center">
            <Link
              href="/"
              className="text-xl md:text-2xl font-bold uppercase tracking-wide text-gray-900 hover:text-gray-700 transition"
            >
              SANDUTA ART
            </Link>
          </div>

          {/* Right Section - Search, Cart, Login/Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar - Hidden on mobile */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Căutare..."
                className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
              <button
                type="submit"
                className="ml-2 p-1.5 text-gray-600 hover:text-gray-900 transition"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Cart Icon */}
            <Link
              href="/checkout"
              className="text-gray-700 hover:text-gray-900 transition p-2"
              aria-label="Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Login/Profile Icon */}
            {session ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="hover:opacity-80 transition"
                  aria-label="Profile"
                >
                  <UserAvatar name={session.user?.name} size="md" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-56 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-600 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Orders
                    </Link>
                    {session.user?.role === Role.ADMIN && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 transition p-2"
                aria-label="Login"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
