'use client';

/**
 * Layout Settings Component
 * Configurare header, footer, spacing și layout general
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { LayoutConfig } from '@/types/theme';

interface LayoutSettingsProps {
  value: LayoutConfig;
  onChange: (layout: LayoutConfig) => void;
}

export function LayoutSettings({ value, onChange }: LayoutSettingsProps) {
  const [layout, setLayout] = useState<LayoutConfig>(value);

  const updateHeader = (field: string, value: any) => {
    const newLayout = {
      ...layout,
      header: {
        ...layout.header,
        [field]: value,
      },
    };
    setLayout(newLayout);
    onChange(newLayout);
  };

  const updateFooter = (field: string, value: any) => {
    const newLayout = {
      ...layout,
      footer: {
        ...layout.footer,
        [field]: value,
      },
    };
    setLayout(newLayout);
    onChange(newLayout);
  };

  const updateContainer = (field: string, value: any) => {
    const newLayout = {
      ...layout,
      container: {
        ...layout.container,
        [field]: value,
      },
    };
    setLayout(newLayout);
    onChange(newLayout);
  };

  const updateSpacing = (key: string, value: string) => {
    const newLayout = {
      ...layout,
      spacing: {
        ...layout.spacing,
        [key]: value,
      },
    };
    setLayout(newLayout);
    onChange(newLayout);
  };

  const updateBorderRadius = (key: string, value: string) => {
    const newLayout = {
      ...layout,
      borderRadius: {
        ...layout.borderRadius,
        [key]: value,
      },
    };
    setLayout(newLayout);
    onChange(newLayout);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Layout Settings</h2>

      {/* Header Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Header</h3>
        
        <div className="space-y-4">
          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <Input
              type="text"
              value={layout.header.height}
              onChange={(e) => updateHeader('height', e.target.value)}
              placeholder="4rem"
            />
          </div>

          {/* Sticky */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={layout.header.sticky}
              onChange={(e) => updateHeader('sticky', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              id="header-sticky"
            />
            <label htmlFor="header-sticky" className="text-sm font-medium text-gray-700">
              Sticky Header (Fixed position on scroll)
            </label>
          </div>

          {/* Logo Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Position
            </label>
            <Select
              value={layout.header.logoPosition}
              onChange={(e) => updateHeader('logoPosition', e.target.value as 'left' | 'center')}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
            </Select>
          </div>

          {/* Menu Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Style
            </label>
            <Select
              value={layout.header.menuStyle}
              onChange={(e) => updateHeader('menuStyle', e.target.value as 'horizontal' | 'hamburger')}
            >
              <option value="horizontal">Horizontal</option>
              <option value="hamburger">Hamburger (Mobile menu)</option>
            </Select>
          </div>

          {/* Show Search */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={layout.header.showSearch}
              onChange={(e) => updateHeader('showSearch', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              id="header-search"
            />
            <label htmlFor="header-search" className="text-sm font-medium text-gray-700">
              Show Search Bar
            </label>
          </div>

          {/* Show Cart */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={layout.header.showCart}
              onChange={(e) => updateHeader('showCart', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              id="header-cart"
            />
            <label htmlFor="header-cart" className="text-sm font-medium text-gray-700">
              Show Cart Icon
            </label>
          </div>

          {/* Show Account */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={layout.header.showAccount}
              onChange={(e) => updateHeader('showAccount', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              id="header-account"
            />
            <label htmlFor="header-account" className="text-sm font-medium text-gray-700">
              Show Account Icon
            </label>
          </div>
        </div>

        {/* Header Preview */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div
            className="border rounded-lg overflow-hidden"
            style={{ height: layout.header.height }}
          >
            <div className="h-full bg-gray-100 flex items-center px-6">
              <div className={`flex items-center ${layout.header.logoPosition === 'center' ? 'justify-center' : 'justify-between'} w-full`}>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-8 bg-gray-300 rounded"></div>
                  {layout.header.menuStyle === 'horizontal' && (
                    <div className="flex gap-4 ml-8">
                      <div className="w-16 h-6 bg-gray-300 rounded"></div>
                      <div className="w-16 h-6 bg-gray-300 rounded"></div>
                      <div className="w-16 h-6 bg-gray-300 rounded"></div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {layout.header.showSearch && <div className="w-8 h-8 bg-gray-300 rounded-full"></div>}
                  {layout.header.showCart && <div className="w-8 h-8 bg-gray-300 rounded-full"></div>}
                  {layout.header.showAccount && <div className="w-8 h-8 bg-gray-300 rounded-full"></div>}
                  {layout.header.menuStyle === 'hamburger' && <div className="w-8 h-8 bg-gray-300 rounded"></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Footer</h3>
        
        <div className="space-y-4">
          {/* Show Logo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={layout.footer.showLogo}
              onChange={(e) => updateFooter('showLogo', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              id="footer-logo"
            />
            <label htmlFor="footer-logo" className="text-sm font-medium text-gray-700">
              Show Logo
            </label>
          </div>

          {/* Show Social */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={layout.footer.showSocial}
              onChange={(e) => updateFooter('showSocial', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              id="footer-social"
            />
            <label htmlFor="footer-social" className="text-sm font-medium text-gray-700">
              Show Social Links
            </label>
          </div>

          {/* Show Newsletter */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={layout.footer.showNewsletter}
              onChange={(e) => updateFooter('showNewsletter', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              id="footer-newsletter"
            />
            <label htmlFor="footer-newsletter" className="text-sm font-medium text-gray-700">
              Show Newsletter Signup
            </label>
          </div>

          {/* Columns Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Columns
            </label>
            <Select
              value={layout.footer.columns.toString()}
              onChange={(e) => updateFooter('columns', parseInt(e.target.value))}
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </Select>
          </div>

          {/* Copyright */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright Text
            </label>
            <Input
              type="text"
              value={layout.footer.copyright}
              onChange={(e) => updateFooter('copyright', e.target.value)}
              placeholder="© 2024 Your Company"
            />
          </div>
        </div>
      </Card>

      {/* Container Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Container</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Width
            </label>
            <Input
              type="text"
              value={layout.container.maxWidth}
              onChange={(e) => updateContainer('maxWidth', e.target.value)}
              placeholder="1280px"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum width of content container
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding (Horizontal)
            </label>
            <Input
              type="text"
              value={layout.container.padding}
              onChange={(e) => updateContainer('padding', e.target.value)}
              placeholder="1rem"
            />
            <p className="text-xs text-gray-500 mt-1">
              Horizontal padding for containers
            </p>
          </div>
        </div>
      </Card>

      {/* Spacing Scale */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(layout.spacing).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <Input
                type="text"
                value={value}
                onChange={(e) => updateSpacing(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {Object.entries(layout.spacing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm font-medium w-16 capitalize">{key}:</span>
              <div
                className="bg-blue-500 h-6"
                style={{ width: value }}
              ></div>
              <span className="text-xs text-gray-500">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Border Radius */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Border Radius</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(layout.borderRadius).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <Input
                type="text"
                value={value}
                onChange={(e) => updateBorderRadius(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(layout.borderRadius).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="w-full h-24 bg-gray-300 mb-2"
                style={{ borderRadius: value }}
              ></div>
              <span className="text-xs text-gray-600 capitalize">{key}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
