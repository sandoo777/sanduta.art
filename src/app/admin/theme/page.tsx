'use client';

/**
 * Theme Customizer - Pagina principală
 * Interfață completă pentru personalizare tema
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BrandingSettings } from '@/components/theme/BrandingSettings';
import { ColorSettings } from '@/components/theme/ColorSettings';
import { TypographySettings } from '@/components/theme/TypographySettings';
import { LayoutSettings } from '@/components/theme/LayoutSettings';
import { ComponentsCustomization } from '@/components/theme/ComponentsCustomization';
import { HomepageBuilder } from '@/components/theme/HomepageBuilder';
import { ThemePreview } from '@/components/theme/ThemePreview';
import type { ThemeConfig } from '@/types/theme';
import { useRouter } from 'next/navigation';

type TabName = 'branding' | 'colors' | 'typography' | 'layout' | 'components' | 'homepage' | 'preview';

const TABS = [
  { id: 'branding', label: 'Branding', icon: '🎨' },
  { id: 'colors', label: 'Colors', icon: '🌈' },
  { id: 'typography', label: 'Typography', icon: '✍️' },
  { id: 'layout', label: 'Layout', icon: '📐' },
  { id: 'components', label: 'Components', icon: '🧩' },
  { id: 'homepage', label: 'Homepage', icon: '🏠' },
  { id: 'preview', label: 'Preview', icon: '👁️' },
];

// Default theme configuration
const DEFAULT_THEME: ThemeConfig = {
  branding: {
    siteName: 'Sanduta Art',
    siteTagline: 'Creează amintiri personalizate',
    logoUrl: '',
    logoDarkUrl: '',
    logoLightUrl: '',
    faviconUrl: '',
    emailFrom: 'noreply@sanduta.art',
    emailFromName: 'Sanduta Art',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
    },
  },
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },
    surface: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    border: {
      default: '#E5E7EB',
      light: '#F3F4F6',
      dark: '#D1D5DB',
    },
  },
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      heading: 'Inter, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    headings: {
      h1: { fontSize: '2.25rem', fontWeight: '700', lineHeight: '1.2', letterSpacing: '-0.02em' },
      h2: { fontSize: '1.875rem', fontWeight: '700', lineHeight: '1.3', letterSpacing: '-0.01em' },
      h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4', letterSpacing: '0' },
      h4: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.4', letterSpacing: '0' },
      h5: { fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.5', letterSpacing: '0' },
      h6: { fontSize: '1rem', fontWeight: '600', lineHeight: '1.5', letterSpacing: '0' },
    },
  },
  layout: {
    header: {
      height: '4rem',
      sticky: true,
      logoPosition: 'left',
      menuStyle: 'horizontal',
      showSearch: true,
      showCart: true,
      showAccount: true,
    },
    footer: {
      showLogo: true,
      showSocial: true,
      showNewsletter: true,
      columns: 4,
      copyright: '© 2024 Sanduta Art. All rights reserved.',
    },
    container: {
      maxWidth: '1280px',
      padding: '1rem',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px',
    },
  },
  components: {
    button: {
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem',
      fontWeight: '500',
      textTransform: 'none',
      shadow: true,
    },
    card: {
      borderRadius: '0.5rem',
      padding: '1.5rem',
      shadow: 'md',
      border: false,
      hoverEffect: true,
    },
    input: {
      borderRadius: '0.375rem',
      padding: '0.5rem 0.75rem',
      borderWidth: '1px',
      focusRing: '2px',
    },
    badge: {
      borderRadius: '9999px',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    alert: {
      borderRadius: '0.5rem',
      padding: '1rem',
      border: true,
      icon: true,
    },
    modal: {
      borderRadius: '0.5rem',
      maxWidth: '32rem',
      backdropBlur: '4px',
      closeOnBackdrop: true,
    },
  },
  homepage: {
    blocks: [],
  },
};

export default function ThemeCustomizerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('branding');
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/theme?version=draft');
      
      if (response.ok) {
        const data = await response.json();
        if (data.theme) {
          setTheme(data.theme);
          setLastSaved(new Date(data.updatedAt));
        }
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (response.ok) {
        const data = await response.json();
        setLastSaved(new Date(data.updatedAt));
        setHasChanges(false);
        alert('✅ Theme saved as draft!');
      } else {
        alert('❌ Failed to save theme');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('❌ Failed to save theme');
    } finally {
      setIsSaving(false);
    }
  };

  const publishTheme = async () => {
    if (!confirm('Are you sure you want to publish this theme? It will be live for all users.')) {
      return;
    }

    try {
      setIsPublishing(true);
      const response = await fetch('/api/admin/theme/publish', {
        method: 'PUT',
      });

      if (response.ok) {
        alert('✅ Theme published successfully!');
        router.push('/');
      } else {
        alert('❌ Failed to publish theme');
      }
    } catch (error) {
      console.error('Failed to publish theme:', error);
      alert('❌ Failed to publish theme');
    } finally {
      setIsPublishing(false);
    }
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading theme customizer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Theme Customizer</h1>
              <p className="text-sm text-gray-600 mt-1">
                Customize your site&apos;s appearance and layout
                {lastSaved && (
                  <span className="ml-2">
                    • Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-orange-600 font-medium">
                  ⚠️ Unsaved changes
                </span>
              )}
              
              <Button
                variant="secondary"
                onClick={saveTheme}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? 'Saving...' : '💾 Save Draft'}
              </Button>

              <Button
                variant="primary"
                onClick={publishTheme}
                disabled={isPublishing || hasChanges}
              >
                {isPublishing ? 'Publishing...' : '🚀 Publish'}
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
              >
                ← Back
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabName)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'branding' && (
          <BrandingSettings
            value={theme.branding}
            onChange={(branding) => updateTheme({ branding })}
          />
        )}

        {activeTab === 'colors' && (
          <ColorSettings
            value={theme.colors}
            onChange={(colors) => updateTheme({ colors })}
          />
        )}

        {activeTab === 'typography' && (
          <TypographySettings
            value={theme.typography}
            onChange={(typography) => updateTheme({ typography })}
          />
        )}

        {activeTab === 'layout' && (
          <LayoutSettings
            value={theme.layout}
            onChange={(layout) => updateTheme({ layout })}
          />
        )}

        {activeTab === 'components' && (
          <ComponentsCustomization
            value={theme.components}
            onChange={(components) => updateTheme({ components })}
          />
        )}

        {activeTab === 'homepage' && (
          <HomepageBuilder
            value={theme.homepage.blocks}
            onChange={(blocks) => updateTheme({ homepage: { blocks } })}
          />
        )}

        {activeTab === 'preview' && (
          <ThemePreview theme={theme} />
        )}
      </main>
    </div>
  );
}
