'use client';

/**
 * Theme Preview Component
 * Live preview cu iframe și responsive modes
 */

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ThemeConfig } from '@/types/theme';

interface ThemePreviewProps {
  theme: ThemeConfig;
  previewUrl?: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES = {
  desktop: { width: '100%', height: '800px', icon: '🖥️', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', icon: '📱', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', icon: '📱', label: 'Mobile' },
};

export function ThemePreview({ theme, previewUrl = '/' }: ThemePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate CSS from theme config
  const generateThemeCSS = (theme: ThemeConfig): string => {
    return `
      :root {
        /* Colors */
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-success: ${theme.colors.success};
        --color-warning: ${theme.colors.warning};
        --color-error: ${theme.colors.error};
        --color-info: ${theme.colors.info};
        
        /* Background */
        --bg-primary: ${theme.colors.background.primary};
        --bg-secondary: ${theme.colors.background.secondary};
        --bg-tertiary: ${theme.colors.background.tertiary};
        
        /* Surface */
        --surface-default: ${theme.colors.surface.default};
        --surface-paper: ${theme.colors.surface.paper};
        --surface-elevated: ${theme.colors.surface.elevated};
        
        /* Text */
        --text-primary: ${theme.colors.text.primary};
        --text-secondary: ${theme.colors.text.secondary};
        --text-disabled: ${theme.colors.text.disabled};
        --text-inverse: ${theme.colors.text.inverse};
        
        /* Border */
        --border-default: ${theme.colors.border.default};
        --border-light: ${theme.colors.border.light};
        --border-dark: ${theme.colors.border.dark};
        
        /* Typography */
        --font-primary: ${theme.typography.fontFamily.primary};
        --font-heading: ${theme.typography.fontFamily.heading};
        --font-size-base: ${theme.typography.fontSize.base};
        
        /* Spacing */
        --spacing-xs: ${theme.layout.spacing.xs};
        --spacing-sm: ${theme.layout.spacing.sm};
        --spacing-md: ${theme.layout.spacing.md};
        --spacing-lg: ${theme.layout.spacing.lg};
        --spacing-xl: ${theme.layout.spacing.xl};
        
        /* Border Radius */
        --radius-sm: ${theme.layout.borderRadius.sm};
        --radius-md: ${theme.layout.borderRadius.md};
        --radius-lg: ${theme.layout.borderRadius.lg};
        --radius-full: ${theme.layout.borderRadius.full};
        
        /* Component Styles */
        --button-radius: ${theme.components.button.borderRadius};
        --card-radius: ${theme.components.card.borderRadius};
        --input-radius: ${theme.components.input.borderRadius};
      }
      
      body {
        font-family: var(--font-primary);
        font-size: var(--font-size-base);
        color: var(--text-primary);
        background-color: var(--bg-primary);
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
    `;
  };

  // Inject theme into iframe
  useEffect(() => {
    if (iframeRef.current && !isLoading) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Remove existing theme style
        const existingStyle = iframeDoc.getElementById('theme-preview-style');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        // Inject new theme style
        const style = iframeDoc.createElement('style');
        style.id = 'theme-preview-style';
        style.textContent = generateThemeCSS(theme);
        iframeDoc.head.appendChild(style);
      }
    }
  }, [theme, isLoading]);

  const refreshPreview = () => {
    setIsLoading(true);
    setPreviewKey((prev) => prev + 1);
  };

  const device = DEVICE_SIZES[deviceMode];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Preview</h3>
            <span className="text-sm text-gray-500">({device.label})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(Object.entries(DEVICE_SIZES) as [DeviceMode, typeof DEVICE_SIZES.desktop][]).map(
                ([mode, config]) => (
                  <button
                    key={mode}
                    onClick={() => setDeviceMode(mode)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      deviceMode === mode
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-200'
                    }`}
                    title={config.label}
                  >
                    {config.icon}
                  </button>
                )
              )}
            </div>

            {/* Refresh Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshPreview}
            >
              🔄 Refresh
            </Button>

            {/* Open in New Tab */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(previewUrl, '_blank')}
            >
              ↗️ Open
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Frame */}
      <Card className="p-6 bg-gray-100">
        <div className="flex justify-center">
          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
            style={{
              width: device.width,
              height: device.height,
              maxWidth: '100%',
            }}
          >
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading preview...</p>
                </div>
              </div>
            )}
            
            <iframe
              key={previewKey}
              ref={iframeRef}
              src={`${previewUrl}?preview=true&theme=${encodeURIComponent(JSON.stringify(theme))}`}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
              title="Theme Preview"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        </div>

        {/* Preview Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Viewing <strong>{previewUrl}</strong> in {device.label} mode
          </p>
          <p className="text-xs mt-1">
            Changes to theme settings will be reflected here in real-time
          </p>
        </div>
      </Card>

      {/* Preview Features */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="font-medium text-sm">Live Updates</h4>
              <p className="text-xs text-gray-600">
                See changes instantly as you edit
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <h4 className="font-medium text-sm">Responsive</h4>
              <p className="text-xs text-gray-600">
                Test on desktop, tablet, and mobile
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h4 className="font-medium text-sm">Full Customization</h4>
              <p className="text-xs text-gray-600">
                Preview all theme changes before publishing
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4">
          <details>
            <summary className="cursor-pointer font-medium text-sm mb-2">
              Debug Info (Dev Only)
            </summary>
            <div className="mt-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs font-mono mb-2">
                  <strong>Preview URL:</strong> {previewUrl}
                </p>
                <p className="text-xs font-mono mb-2">
                  <strong>Device Mode:</strong> {deviceMode} ({device.width} × {device.height})
                </p>
                <p className="text-xs font-mono mb-2">
                  <strong>Theme Version:</strong> {(theme as any).version || 'draft'}
                </p>
                <p className="text-xs font-mono">
                  <strong>Last Updated:</strong> {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </details>
        </Card>
      )}
    </div>
  );
}

// Standalone preview page component
export function ThemePreviewPage() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    // Get theme from URL params
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    
    if (themeParam) {
      try {
        const parsedTheme = JSON.parse(decodeURIComponent(themeParam));
        setTheme(parsedTheme);
      } catch (error) {
        console.error('Failed to parse theme:', error);
      }
    }
  }, []);

  if (!theme) {
    return null; // Let the actual page content show
  }

  // This component is rendered inside the preview iframe
  // It applies the theme styles without blocking the actual page
  return null;
}
