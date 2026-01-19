'use client';

import { useCurrentUser } from "@/modules/auth/useCurrentUser";
import Link from "next/link";
import { 
  ShoppingBag, 
  FolderOpen, 
  MapPin, 
  Bell, 
  FileText, 
  Settings,
  ArrowRight,
  Package,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui';

export default function AccountDashboardPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const quickStats = [
    {
      label: 'Comenzi Active',
      value: '3',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Comenzi Finalizate',
      value: '12',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Proiecte Salvate',
      value: '5',
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Notificări Noi',
      value: '2',
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const quickLinks = [
    {
      title: 'Comenzile Mele',
      description: 'Vezi și urmărește toate comenzile tale',
      icon: ShoppingBag,
      href: '/account/orders',
      color: 'indigo',
    },
    {
      title: 'Proiectele Mele',
      description: 'Gestionează proiectele create în editor',
      icon: FolderOpen,
      href: '/account/projects',
      color: 'purple',
    },
    {
      title: 'Adresele Mele',
      description: 'Adaugă sau editează adrese de livrare',
      icon: MapPin,
      href: '/account/addresses',
      color: 'green',
    },
    {
      title: 'Profil',
      description: 'Actualizează informațiile personale',
      icon: User,
      href: '/account/profile',
      color: 'blue',
    },
    {
      title: 'Notificări',
      description: 'Vezi notificările despre comenzi',
      icon: Bell,
      href: '/account/notifications',
      color: 'red',
    },
    {
      title: 'Facturi',
      description: 'Descarcă facturile pentru comenzi',
      icon: FileText,
      href: '/account/invoices',
      color: 'yellow',
    },
    {
      title: 'Setări Cont',
      description: 'Schimbă parola și preferințele',
      icon: Settings,
      href: '/account/settings',
      color: 'gray',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bine ai venit, {user?.name || 'Client'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Gestionează comenzile, proiectele și setările contului tău
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acces Rapid
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group"
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${link.color}-100 group-hover:bg-${link.color}-200 transition-colors`}>
                      <Icon className={`w-6 h-6 text-${link.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center justify-between">
                        {link.title}
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-sm text-gray-600">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Activitate Recentă
        </h2>
        <Card className="divide-y divide-gray-200">
          <div className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Comanda #ORD-12345 a fost livrată
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Acum 2 zile
              </p>
            </div>
            <Link
              href="/account/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Vezi →
            </Link>
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-full bg-blue-100">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Comanda #ORD-12344 este în producție
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Acum 3 zile
              </p>
            </div>
            <Link
              href="/account/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Vezi →
            </Link>
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-full bg-purple-100">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Ai salvat un nou proiect: &quot;Fluturași Promo&quot;
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Acum 5 zile
              </p>
            </div>
            <Link
              href="/account/projects"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Vezi →
            </Link>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-indigo-100">
            <Settings className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Ai nevoie de ajutor?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Explorează ghidul nostru sau contactează echipa de suport pentru asistență
            </p>
            <div className="flex gap-3">
              <Link
                href="/help"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Ghid Utilizator →
              </Link>
              <Link
                href="/contact"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Contact Suport →
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
