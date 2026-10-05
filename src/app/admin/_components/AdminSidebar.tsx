'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  Cpu,
  Factory,
  LayoutDashboard,
  Package,
  PackageCheck,
  Printer,
  Scissors,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  UserCog,
  Users,
  Warehouse,
  X,
  type LucideIcon,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type SidebarItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type SidebarSection = {
  id: string;
  title: string;
  emoji: string;
  accent: 'blue' | 'purple' | 'green';
  items: SidebarItem[];
};

const STORAGE_KEY = 'adminSidebarState';

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'catalog',
    title: 'Catalog',
    emoji: '📦',
    accent: 'blue',
    items: [
      { name: 'Produse', href: '/admin/products', icon: Package },
      { name: 'Categorii', href: '/admin/categories', icon: Tag },
      { name: 'Clienți', href: '/admin/customers', icon: Users },
    ],
  },
  {
    id: 'depozit',
    title: 'Depozit',
    emoji: '🏭',
    accent: 'purple',
    items: [
      { name: 'Inventar', href: '/admin/inventory', icon: Warehouse },
      { name: 'Comenzi Achiziții', href: '/admin/purchase-orders', icon: PackageCheck },
      { name: 'Furnizori', href: '/admin/suppliers', icon: Truck },
    ],
  },
  {
    id: 'productie',
    title: 'Producție',
    emoji: '🏭',
    accent: 'purple',
    items: [
      { name: 'Comenzi', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Coadă Producție', href: '/admin/production', icon: Factory },
      { name: 'Echipamente', href: '/admin/machines', icon: Cpu },
      { name: 'Materiale', href: '/admin/materials', icon: Boxes },
      { name: 'Formate', href: '/admin/formats', icon: Tag },
      { name: 'Metode Printare', href: '/admin/print-methods', icon: Printer },
      { name: 'Finisare', href: '/admin/finishing', icon: Scissors },
      { name: 'Parteneri', href: '/admin/partners', icon: Truck },
    ],
  },
  {
    id: 'sistem',
    title: 'Sistem',
    emoji: '⚙️',
    accent: 'green',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Utilizatori', href: '/admin/users', icon: UserCog },
      { name: 'Rapoarte', href: '/admin/reports', icon: BarChart3 },
      { name: 'Setări', href: '/admin/settings', icon: Settings },
    ],
  },
];

const defaultSectionState = {
  catalog: false,
  depozit: true,
  productie: true,
  sistem: false,
};

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') {
      return defaultSectionState;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return defaultSectionState;
      }

      return { ...defaultSectionState, ...JSON.parse(stored) };
    } catch {
      return defaultSectionState;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(openSections));
    }
  }, [openSections]);

  useEffect(() => {
    if (!pathname) return;

    const activeSection = SIDEBAR_SECTIONS.find((section) =>
      section.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    );

    if (activeSection) {
      setOpenSections((current) => ({
        ...current,
        [activeSection.id]: true,
      }));
    }
  }, [pathname]);

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const toggleSection = (id: string) => {
    setOpenSections((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const renderNavSection = (section: SidebarSection) => {
    const isExpanded = Boolean(openSections[section.id]);
    const colorClasses = {
      blue: {
        bg: 'bg-blue-900/20',
        active: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-900/50',
        hover: 'hover:bg-gray-800',
        icon: 'text-blue-400',
        iconActive: 'text-white',
        border: 'border-l-4 border-blue-500',
        title: 'text-blue-400',
      },
      purple: {
        bg: 'bg-purple-900/20',
        active: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-900/50',
        hover: 'hover:bg-gray-800',
        icon: 'text-purple-400',
        iconActive: 'text-white',
        border: 'border-l-4 border-purple-500',
        title: 'text-purple-400',
      },
      green: {
        bg: 'bg-green-900/20',
        active: 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-900/50',
        hover: 'hover:bg-gray-800',
        icon: 'text-green-400',
        iconActive: 'text-white',
        border: 'border-l-4 border-green-500',
        title: 'text-green-400',
      },
    } as const;

    const colors = colorClasses[section.accent];

    return (
      <div key={section.id} className="mb-5">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={`${section.id}-menu`}
          onClick={() => toggleSection(section.id)}
          className={`mx-2 mb-3 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2 text-left transition-all ${colors.border}`}
        >
          <span className={`text-xs font-bold ${colors.title} uppercase tracking-wide flex items-center gap-2`}>
            <span className="text-base">{section.emoji}</span>
            {section.title}
          </span>
          <span className="text-gray-300">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </button>

        {isExpanded && (
          <ul id={`${section.id}-menu`} role="menu" className="space-y-1 px-2">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.name} role="none">
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={onClose}
                    role="menuitem"
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 ease-in-out
                      ${active
                        ? `${colors.active} font-semibold ${colors.border}`
                        : `text-gray-300 ${colors.hover} hover:text-white hover:shadow-sm hover:translate-x-1`}
                    `}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${active ? 'bg-white/20' : `${colors.bg} group-hover:scale-110`}`}>
                      <Icon className={`w-4 h-4 ${active ? colors.iconActive : colors.icon}`} />
                    </div>
                    <span className={`text-sm flex-1 ${active ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900">
          <Link href="/admin" prefetch={false} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-900/50 group-hover:shadow-lg group-hover:shadow-purple-800/50 transition-all duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white">Admin</span>
              <p className="text-[10px] text-gray-400 font-medium">Control Panel</p>
            </div>
          </Link>

          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          {SIDEBAR_SECTIONS.map((section) => renderNavSection(section))}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">💡</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Need Help?</p>
                <p className="text-xs text-gray-400 mt-0.5">Check our documentation</p>
                <Link href="/docs" prefetch={false} className="text-xs text-purple-400 hover:text-purple-300 font-semibold mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
                  View Docs
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
