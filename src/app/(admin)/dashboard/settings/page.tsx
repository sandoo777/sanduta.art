"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  Key,
  Settings,
  Activity,
  Plug,
  Lock,
  Database,
  Bell,
  Mail,
  CreditCard,
  Globe,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  requiresAdmin?: boolean;
}

const settingsSections: SettingsSection[] = [
  {
    id: "users",
    title: "Utilizatori",
    description: "Gestionează utilizatorii interni ai platformei",
    icon: Users,
    href: "/dashboard/settings/users",
    color: "blue",
  },
  {
    id: "roles",
    title: "Roluri",
    description: "Configurează rolurile și permisiunile asociate",
    icon: Shield,
    href: "/dashboard/settings/roles",
    color: "purple",
    requiresAdmin: true,
  },
  {
    id: "permissions",
    title: "Permisiuni",
    description: "Vizualizează și gestionează permisiunile sistemului",
    icon: Key,
    href: "/dashboard/settings/permissions",
    color: "green",
    requiresAdmin: true,
  },
  {
    id: "platform",
    title: "Setări Platformă",
    description: "Configurează setările generale ale platformei",
    icon: Settings,
    href: "/dashboard/settings/platform",
    color: "orange",
  },
  {
    id: "audit-logs",
    title: "Audit Logs",
    description: "Vizualizează istoricul acțiunilor utilizatorilor",
    icon: Activity,
    href: "/dashboard/settings/audit-logs",
    color: "red",
  },
  {
    id: "integrations",
    title: "Integrări",
    description: "Gestionează integrările cu servicii externe",
    icon: Plug,
    href: "/dashboard/settings/integrations",
    color: "indigo",
  },
  {
    id: "security",
    title: "Securitate",
    description: "Configurează setările de securitate și autentificare",
    icon: Lock,
    href: "/dashboard/settings/security",
    color: "pink",
    requiresAdmin: true,
  },
];

const quickActions = [
  {
    icon: Users,
    label: "Adaugă Utilizator",
    href: "/dashboard/settings/users?action=create",
    color: "blue",
  },
  {
    icon: Bell,
    label: "Configurează Notificări",
    href: "/dashboard/settings/platform?section=notifications",
    color: "green",
  },
  {
    icon: Mail,
    label: "Setări Email",
    href: "/dashboard/settings/platform?section=email",
    color: "orange",
  },
  {
    icon: Activity,
    label: "Vizualizează Logs",
    href: "/dashboard/settings/audit-logs",
    color: "red",
  },
];

export default function AdminSettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = settingsSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Setări Admin & Permisiuni
          </h1>
          <p className="text-gray-600">
            Gestionează utilizatorii, rolurile, permisiunile și configurările platformei
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Caută setări..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acțiuni Rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`
                    p-4 bg-white border border-gray-200 rounded-lg
                    hover:shadow-md transition-all duration-200
                    flex items-center gap-3
                  `}
                >
                  <div className={`p-2 bg-${action.color}-100 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <span className="font-medium text-gray-900">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings Sections */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Secțiuni Setări</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className="
                    bg-white border border-gray-200 rounded-lg p-6
                    hover:shadow-lg hover:border-gray-300
                    transition-all duration-200
                    group
                  "
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${section.color}-100 rounded-lg group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 text-${section.color}-600`} />
                    </div>
                    {section.requiresAdmin && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {section.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <Database className="w-5 h-5 inline mr-2" />
            Informații Sistem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Versiune Platformă</div>
              <div className="text-lg font-semibold text-gray-900">v1.0.0</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Mediu</div>
              <div className="text-lg font-semibold text-gray-900">
                {process.env.NODE_ENV === "production" ? "Producție" : "Dezvoltare"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Database</div>
              <div className="text-lg font-semibold text-gray-900">PostgreSQL</div>
            </div>
          </div>
        </div>

        {/* Warning for sensitive actions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Atenție: Zona Sensibilă
              </h3>
              <p className="text-sm text-yellow-800">
                Modificările în această secțiune pot afecta funcționarea întregii platforme.
                Asigură-te că înțelegi impactul fiecărei modificări înainte de a o aplica.
                Toate acțiunile sunt înregistrate în audit logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
