/**
 * SEO Settings - Global SEO configuration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Settings, Save, Search, Globe, FileText, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCms, type SeoSettings, type UpdateSeoSettingsInput } from '@/modules/cms/useCms';

export default function CmsSeoPage() {
  const cms = useCms();
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [formData, setFormData] = useState<UpdateSeoSettingsInput>({});
  const [activeTab, setActiveTab] = useState<'general' | 'meta' | 'tracking' | 'advanced'>('general');

  const loadSettings = useCallback(async () => {
    const data = await cms.fetchSeoSettings();
    if (data) {
      setSettings(data);
      setFormData({
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        siteUrl: data.siteUrl,
        defaultTitle: data.defaultTitle,
        defaultDescription: data.defaultDescription,
        defaultKeywords: data.defaultKeywords,
        favicon: data.favicon,
        ogDefaultImage: data.ogDefaultImage,
        twitterHandle: data.twitterHandle,
        googleAnalyticsId: data.googleAnalyticsId,
        googleTagManagerId: data.googleTagManagerId,
        facebookPixelId: data.facebookPixelId,
        robotsTxt: data.robotsTxt,
        enableSitemap: data.enableSitemap,
      });
    }
  }, [cms]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await cms.updateSeoSettings(formData);
    if (result) {
      alert('Setări salvate cu succes!');
      await loadSettings();
    }
  };

  const handleGenerateSitemap = async () => {
    const success = await cms.generateSitemap();
    if (success) {
      alert('Sitemap generat cu succes! Disponibil la /sitemap.xml');
    } else {
      alert('Eroare la generarea sitemap-ului');
    }
  };

  if (!settings) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">Se încarcă setările SEO...</p>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Globe },
    { id: 'meta' as const, label: 'Meta Tags', icon: FileText },
    { id: 'tracking' as const, label: 'Tracking', icon: Search },
    { id: 'advanced' as const, label: 'Avansat', icon: Settings },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          SEO Settings
        </h1>
        <p className="text-sm text-gray-600">
          Configurare globală SEO: meta tags, sitemap, robots.txt și tracking
        </p>
      </div>

      {/* Tabs */}
      <Card className="p-2 mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* General Tab */}
        {activeTab === 'general' && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Informații Generale
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Site *
                </label>
                <Input
                  type="text"
                  value={formData.siteName || ''}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  required
                  placeholder="sanduta.art"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere Site
                </label>
                <textarea
                  value={formData.siteDescription || ''}
                  onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Produse personalizate de calitate..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Site *
                </label>
                <Input
                  type="url"
                  value={formData.siteUrl || ''}
                  onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                  required
                  placeholder="https://sanduta.art"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon URL
                </label>
                <Input
                  type="url"
                  value={formData.favicon || ''}
                  onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                  placeholder="https://sanduta.art/favicon.ico"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Icon-ul care apare în tab-ul browserului (32x32 sau 16x16 px)
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Meta Tags Tab */}
        {activeTab === 'meta' && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Meta Tags Implicite
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titlu Implicit
                </label>
                <Input
                  type="text"
                  value={formData.defaultTitle || ''}
                  onChange={(e) => setFormData({ ...formData, defaultTitle: e.target.value })}
                  placeholder="sanduta.art - Produse Personalizate"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Titlu folosit când pagina nu are titlu specific (max 60 caractere)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere Implicită
                </label>
                <textarea
                  value={formData.defaultDescription || ''}
                  onChange={(e) => setFormData({ ...formData, defaultDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descriere folosită când pagina nu are descriere specifică..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descriere pentru motoarele de căutare (150-160 caractere)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuvinte Cheie Implicite
                </label>
                <Input
                  type="text"
                  value={formData.defaultKeywords?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    defaultKeywords: e.target.value.split(',').map(k => k.trim()) 
                  })}
                  placeholder="produse personalizate, cadouri, print on demand"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate prin virgulă
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenGraph Imagine Implicită
                </label>
                <Input
                  type="url"
                  value={formData.ogDefaultImage || ''}
                  onChange={(e) => setFormData({ ...formData, ogDefaultImage: e.target.value })}
                  placeholder="https://sanduta.art/og-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Imagine pentru share-uri pe Facebook/LinkedIn (1200x630 px)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Handle
                </label>
                <Input
                  type="text"
                  value={formData.twitterHandle || ''}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                  placeholder="@sandutaart"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cont Twitter pentru Twitter Cards
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Tracking & Analytics
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <Input
                  type="text"
                  value={formData.googleAnalyticsId || ''}
                  onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Google Analytics 4 Measurement ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Tag Manager ID
                </label>
                <Input
                  type="text"
                  value={formData.googleTagManagerId || ''}
                  onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Google Tag Manager Container ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <Input
                  type="text"
                  value={formData.facebookPixelId || ''}
                  onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                  placeholder="XXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Facebook Pixel pentru remarketing
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Notă:</strong> După salvarea ID-urilor, acestea vor fi automat integrate 
                  în toate paginile site-ului prin layout-ul global.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Setări Avansate
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    robots.txt
                  </label>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Vezi robots.txt →
                  </a>
                </div>
                <textarea
                  value={formData.robotsTxt || ''}
                  onChange={(e) => setFormData({ ...formData, robotsTxt: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={`User-agent: *\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://sanduta.art/sitemap.xml`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Conținutul fișierului robots.txt pentru crawlere (Google, Bing, etc.)
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enableSitemap ?? false}
                    onChange={(e) => setFormData({ ...formData, enableSitemap: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Activează Sitemap XML
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Generează automat sitemap.xml cu toate paginile și articolele blog
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleGenerateSitemap}
                  variant="secondary"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerează Sitemap Acum
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Forțează regenerarea sitemap-ului cu datele curente. Disponibil la{' '}
                  <a href="/sitemap.xml" target="_blank" className="text-blue-600 hover:underline">
                    /sitemap.xml
                  </a>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={loadSettings}>
            Resetează
          </Button>
          <Button type="submit" loading={cms.loading}>
            <Save className="h-4 w-4 mr-2" />
            Salvează Setări
          </Button>
        </div>
      </form>

      {/* Last Updated */}
      {settings.updatedAt && (
        <p className="text-sm text-gray-500 text-center mt-6">
          Ultima actualizare: {new Date(settings.updatedAt).toLocaleString('ro-RO')}
        </p>
      )}
    </div>
  );
}
