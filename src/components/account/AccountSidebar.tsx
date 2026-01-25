"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthLink } from "@/components/common/links/AuthLink";
import {
  ShoppingBagIcon,
  FolderIcon,
  MapPinIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentDuplicateIcon,
  BellIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Comenzile mele",
    href: "/dashboard/orders",
    icon: ShoppingBagIcon,
  },
  {
    label: "Proiectele mele",
    href: "/dashboard/projects",
    icon: FolderIcon,
  },
  {
    label: "Fișiere salvate",
    href: "/dashboard/files",
    icon: DocumentDuplicateIcon,
  },
  {
    label: "Notificări",
    href: "/dashboard/notifications",
    icon: BellIcon,
  },
  {
    label: "Adrese",
    href: "/dashboard/addresses",
    icon: MapPinIcon,
  },
  {
    label: "Date personale",
    href: "/dashboard/profile",
    icon: UserIcon,
  },
  {
    label: "Preferințe",
    href: "/dashboard/preferences",
    icon: AdjustmentsHorizontalIcon,
  },
  {
    label: "Setări cont",
    href: "/dashboard/settings",
    icon: Cog6ToothIcon,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Contul meu</h2>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <AuthLink
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200">
        <div className="mb-4">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="px-3 py-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Ieșire
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-900" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-900" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-200 min-h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}
