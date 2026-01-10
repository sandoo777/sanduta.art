/**
 * Marketing Hub - Pagină Principală
 */

'use client';

import Link from 'next/link';
import { 
  Tag, 
  Megaphone, 
  Mail, 
  Users, 
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Zap,
  Target,
  Gift,
  Calendar,
  Percent
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface MarketingCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: string;
  };
}

const marketingCards: MarketingCard[] = [
  {
    title: 'Cupoane',
    description: 'Creează și gestionează cupoane de reducere pentru clienți',
    icon: Tag,
    href: '/dashboard/marketing/coupons',
    color: 'text-blue-600',
    stats: { label: 'Active', value: '12' },
  },
  {
    title: 'Campanii',
    description: 'Planifică și urmărește campanii promoționale și reduceri',
    icon: Megaphone,
    href: '/dashboard/marketing/campaigns',
    color: 'text-purple-600',
    stats: { label: 'În desfășurare', value: '3' },
  },
  {
    title: 'Email Automation',
    description: 'Automatizează email-uri: welcome, coș abandonat, follow-up',
    icon: Mail,
    href: '/dashboard/marketing/automation',
    color: 'text-green-600',
    stats: { label: 'Automatizări', value: '8' },
  },
  {
    title: 'Segmente Clienți',
    description: 'Segmentează clienții după comportament și preferințe',
    icon: Users,
    href: '/dashboard/marketing/segments',
    color: 'text-orange-600',
    stats: { label: 'Segmente', value: '6' },
  },
  {
    title: 'Marketing Analytics',
    description: 'Analizează performanța campaniilor și ROI marketing',
    icon: BarChart3,
    href: '/dashboard/marketing/analytics',
    color: 'text-pink-600',
    stats: { label: 'ROI mediu', value: '320%' },
  },
];

const quickStats = [
  { label: 'Venit Marketing Lunar', value: '45,890 lei', change: '+18%', icon: TrendingUp, color: 'text-green-600' },
  { label: 'Conversii Cupoane', value: '234', change: '+12%', icon: ShoppingCart, color: 'text-blue-600' },
  { label: 'Email Open Rate', value: '42%', change: '+5%', icon: Mail, color: 'text-purple-600' },
  { label: 'Clienți Activi', value: '1,245', change: '+8%', icon: Users, color: 'text-orange-600' },
];

const upcomingCampaigns = [
  { name: 'Campanie Sf. Valentin', startDate: '2026-02-10', discount: '15%', status: 'Programată' },
  { name: 'Flash Sale Weekend', startDate: '2026-01-15', discount: '20%', status: 'În curând' },
  { name: 'Bundle Promoție', startDate: '2026-01-20', discount: '25%', status: 'Programată' },
];

const recentActivity = [
  { action: 'Cupon WELCOME10 activat', time: 'Acum 2 ore', icon: Tag },
  { action: 'Email „Coș Abandonat" trimis către 45 clienți', time: 'Acum 3 ore', icon: Mail },
  { action: 'Campanie Flash Sale finalizată - 89 conversii', time: 'Azi, 10:30', icon: Megaphone },
  { action: 'Segment „Clienți VIP" actualizat - 12 membri noi', time: 'Ieri, 18:20', icon: Users },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Hub</h1>
          <p className="mt-2 text-gray-600">
            Gestionează cupoane, campanii, email automation și analizează performanța marketing
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/marketing/coupons">
            <Button variant="secondary">
              <Tag className="mr-2 h-4 w-4" />
              Creare Cupon
            </Button>
          </Link>
          <Link href="/dashboard/marketing/campaigns">
            <Button variant="primary">
              <Megaphone className="mr-2 h-4 w-4" />
              Campanie Nouă
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`mt-1 text-sm font-medium ${stat.color}`}>
                    {stat.change} față de luna trecută
                  </p>
                </div>
                <div className={`rounded-full bg-gray-100 p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Marketing Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {marketingCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg bg-gray-100 p-3 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {card.stats && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{card.stats.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.stats.value}</p>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{card.description}</p>
                <Button variant="ghost" className="mt-4 w-full justify-center">
                  Deschide {card.title}
                </Button>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Upcoming Campaigns & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Campaigns */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Campanii Viitoare</h2>
            </div>
            <Link href="/dashboard/marketing/campaigns">
              <Button variant="ghost" size="sm">
                Vezi toate
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingCampaigns.map((campaign, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{campaign.name}</p>
                  <p className="text-sm text-gray-600">Start: {campaign.startDate}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">{campaign.discount}</span>
                  </div>
                  <p className="text-xs text-gray-500">{campaign.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Activitate Recentă</h2>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0">
                  <div className="rounded-full bg-gray-100 p-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Ce poți face cu Marketing Hub</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Tag className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Cupoane Inteligente</p>
              <p className="text-sm text-gray-600">Reduceri procentuale, fixe, transport gratuit, restricții pe categorie/produs</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Megaphone className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Campanii Promoționale</p>
              <p className="text-sm text-gray-600">Flash sales, reduceri sezoniere, bundle-uri, campanii targetate</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <Mail className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Automation</p>
              <p className="text-sm text-gray-600">Welcome series, coș abandonat, follow-up, reactivare, campanii automate</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Segmentare Clienți</p>
              <p className="text-sm text-gray-600">Clienți noi, recurenți, VIP, inactivi, segmente custom cu filtre multiple</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-pink-100 p-2">
              <BarChart3 className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Analytics Detaliate</p>
              <p className="text-sm text-gray-600">ROI, conversii, open rate, click rate, venit per segment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-indigo-100 p-2">
              <Gift className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Trigger Automat</p>
              <p className="text-sm text-gray-600">Acțiuni automate bazate pe comportament: coș abandonat, inactivitate, aniversare</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
