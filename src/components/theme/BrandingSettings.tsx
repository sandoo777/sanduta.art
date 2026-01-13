'use client';

/**
 * Branding Settings Component
 * Configurare logo, favicon, brand name și social links
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { BrandingConfig } from '@/types/theme';

interface BrandingSettingsProps {
  value: BrandingConfig;
  onChange: (config: BrandingConfig) => void;
}

export function BrandingSettings({ value, onChange }: BrandingSettingsProps) {
  const [config, setConfig] = useState<BrandingConfig>(value);

  const updateConfig = (updates: Partial<BrandingConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const handleLogoUpload = async (file: File, type: 'main' | 'dark' | 'light' | 'favicon') => {
    // TODO: Implement actual file upload
    const url = URL.createObjectURL(file);
    updateConfig({
      logo: { ...config.logo, [type]: url },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Branding</h2>

      {/* Site Name */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Site Identity</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <Input
              value={config.siteName}
              onChange={(e) => updateConfig({ siteName: e.target.value })}
              placeholder="Your Brand Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <Input
              value={config.tagline}
              onChange={(e) => updateConfig({ tagline: e.target.value })}
              placeholder="Your brand slogan or tagline"
            />
          </div>
        </div>
      </Card>

      {/* Logos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Logos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {config.logo.main ? (
                <div className="space-y-2">
                  <img
                    src={config.logo.main}
                    alt="Main Logo"
                    className="max-h-24 mx-auto"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateConfig({ logo: { ...config.logo, main: '' } })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleLogoUpload(e.target.files[0], 'main')
                    }
                  />
                  <div className="text-gray-600">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p>Upload Main Logo</p>
                    <p className="text-sm text-gray-500">PNG, SVG (Max 2MB)</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Dark Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dark Mode Logo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-900">
              {config.logo.dark ? (
                <div className="space-y-2">
                  <img
                    src={config.logo.dark}
                    alt="Dark Logo"
                    className="max-h-24 mx-auto"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateConfig({ logo: { ...config.logo, dark: undefined } })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleLogoUpload(e.target.files[0], 'dark')
                    }
                  />
                  <div className="text-gray-400">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p>Upload Dark Logo</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {config.logo.favicon ? (
                <div className="space-y-2">
                  <img
                    src={config.logo.favicon}
                    alt="Favicon"
                    className="w-16 h-16 mx-auto"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateConfig({ logo: { ...config.logo, favicon: '' } })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleLogoUpload(e.target.files[0], 'favicon')
                    }
                  />
                  <div className="text-gray-600">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p>Upload Favicon</p>
                    <p className="text-sm text-gray-500">32x32 PNG/ICO</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Email Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Name
            </label>
            <Input
              value={config.email.senderName}
              onChange={(e) =>
                updateConfig({
                  email: { ...config.email, senderName: e.target.value },
                })
              }
              placeholder="Your Brand Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Email
            </label>
            <Input
              type="email"
              value={config.email.senderEmail}
              onChange={(e) =>
                updateConfig({
                  email: { ...config.email, senderEmail: e.target.value },
                })
              }
              placeholder="noreply@yourdomain.com"
            />
          </div>
        </div>
      </Card>

      {/* Social Links */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
        
        <div className="space-y-4">
          {[
            { key: 'facebook', label: 'Facebook', icon: '📘' },
            { key: 'instagram', label: 'Instagram', icon: '📷' },
            { key: 'twitter', label: 'Twitter', icon: '🐦' },
            { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
            { key: 'youtube', label: 'YouTube', icon: '📺' },
          ].map(({ key, label, icon }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {icon} {label}
              </label>
              <Input
                type="url"
                value={config.social[key as keyof typeof config.social] || ''}
                onChange={(e) =>
                  updateConfig({
                    social: { ...config.social, [key]: e.target.value },
                  })
                }
                placeholder={`https://${key}.com/yourpage`}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
