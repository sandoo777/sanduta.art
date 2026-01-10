/**
 * CMS Hub - Content Management System
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  BookOpen, 
  Image as ImageIcon, 
  Layout, 
  Settings,
  ChevronRight,
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useCms } from '@/modules/cms/useCms';

export default function CmsHubPage() {
  const cms = useCms();
  const [stats, setStats] = useState({
    pagesTotal: 0,
    pagesPublished: 0,
    blogTotal: 0,
    blogPublished: 0,
    mediaTotal: 0,
    bannersActive: 0,
  });

  const loadStats = async () => {
    const [pages, posts, media, banners] = await Promise.all([
      cms.fetchPages(),
      cms.fetchBlogPosts(),
      cms.fetchMedia(),
      cms.fetchBanners(),
    ]);

    setStats({
      pagesTotal: pages.length,
      pagesPublished: pages.filter(p => p.status === 'PUBLISHED').length,
      blogTotal: posts.length,
      blogPublished: posts.filter(p => p.status === 'PUBLISHED').length,
      mediaTotal: media.length,
      bannersActive: banners.filter(b => b.active).length,
    });
  };

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const loadStats = async () => {
    const [pages, posts, media, banners] = await Promise.all([
      cms.fetchPages(),
      cms.fetchBlogPosts(),
      cms.fetchMedia(),
      cms.fetchBanners(),
    ]);

    setStats({
      pagesTotal: pages.length,
      pagesPublished: pages.filter(p => p.status === 'PUBLISHED').length,
      blogTotal: posts.length,
      blogPublished: posts.filter(p => p.status === 'PUBLISHED').length,
      mediaTotal: media.length,
      bannersActive: banners.filter(b => b.active).length,
    });
  };

  const modules = [
    {
      icon: FileText,
      title: 'Pagini',
      description: 'Gestionează pagini statice, landing pages și conținut custom',
      href: '/dashboard/cms/pages',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      stats: [
        { label: 'Total', value: stats.pagesTotal },
        { label: 'Publicate', value: stats.pagesPublished },
      ],
    },
    {
      icon: BookOpen,
      title: 'Blog',
      description: 'Articole, categorii, tag-uri și gestionare conținut blog',
      href: '/dashboard/cms/blog',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      stats: [
        { label: 'Articole', value: stats.blogTotal },
        { label: 'Publicate', value: stats.blogPublished },
      ],
    },
    {
      icon: Layout,
      title: 'Bannere',
      description: 'Bannere promoționale pentru homepage, sidebar și checkout',
      href: '/dashboard/cms/banners',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      stats: [
        { label: 'Active', value: stats.bannersActive },
        { label: '5 poziții', value: '' },
      ],
    },
    {
      icon: ImageIcon,
      title: 'Media Library',
      description: 'Imagini, PDF-uri și alte fișiere pentru conținut',
      href: '/dashboard/cms/media',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      stats: [
        { label: 'Fișiere', value: stats.mediaTotal },
        { label: 'Organizate', value: '' },
      ],
    },
    {
      icon: Settings,
      title: 'SEO Settings',
      description: 'Meta tags, sitemap, robots.txt și optimizare SEO',
      href: '/dashboard/cms/seo',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      stats: [
        { label: 'Sitemap', value: '✓' },
        { label: 'Robots.txt', value: '✓' },
      ],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Content Management System
        </h1>
        <p className="text-gray-600">
          Gestionează conținutul site-ului: pagini, blog, bannere, media și SEO
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Pagini</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pagesTotal}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.pagesPublished} publicate
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Articole Blog</span>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.blogTotal}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.blogPublished} publicate
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Media Files</span>
            <ImageIcon className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.mediaTotal}</div>
          <div className="text-xs text-gray-500 mt-1">imagini, PDF-uri</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bannere Active</span>
            <Layout className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.bannersActive}</div>
          <div className="text-xs text-gray-500 mt-1">5 poziții</div>
        </Card>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${module.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {module.description}
                </p>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  {module.stats.map((stat, idx) => (
                    <div key={idx} className="flex-1">
                      <div className="text-xs text-gray-500">{stat.label}</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          Activitate Recentă
        </h2>
        <div className="space-y-3">
          <ActivityItem
            type="page"
            action="creat"
            title="Despre Noi"
            time="acum 2 ore"
          />
          <ActivityItem
            type="blog"
            action="publicat"
            title="Ghid Produse Personalizate 2025"
            time="acum 5 ore"
          />
          <ActivityItem
            type="banner"
            action="activat"
            title="Banner Reduceri Sărbători"
            time="acum 1 zi"
          />
          <ActivityItem
            type="media"
            action="încărcat"
            title="10 imagini noi"
            time="acum 2 zile"
          />
        </div>
      </Card>
    </div>
  );
}

function ActivityItem({ 
  type, 
  action, 
  title, 
  time 
}: { 
  type: 'page' | 'blog' | 'banner' | 'media'; 
  action: string; 
  title: string; 
  time: string; 
}) {
  const icons = {
    page: FileText,
    blog: BookOpen,
    banner: Layout,
    media: ImageIcon,
  };

  const colors = {
    page: 'text-blue-500 bg-blue-50',
    blog: 'text-purple-500 bg-purple-50',
    banner: 'text-green-500 bg-green-50',
    media: 'text-orange-500 bg-orange-50',
  };

  const Icon = icons[type];

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded ${colors[type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900">
          <span className="font-medium">{action}</span> {title}
        </div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  );
}
