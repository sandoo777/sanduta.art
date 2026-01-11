'use client';

/**
 * Typography Settings Component
 * Configurare fonturi cu Google Fonts integration
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { TypographyConfig } from '@/types/theme';

interface TypographySettingsProps {
  value: TypographyConfig;
  onChange: (typography: TypographyConfig) => void;
}

const FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];

export function TypographySettings({ value, onChange }: TypographySettingsProps) {
  const [typography, setTypography] = useState<TypographyConfig>(value);

  useEffect(() => {
    onChange(typography);
  }, [typography, onChange]);

  const updateFontFamily = (key: 'primary' | 'heading', font: string) => {
    setTypography((prev) => ({
      ...prev,
      fontFamily: {
        ...prev.fontFamily,
        [key]: font,
      },
    }));
  };

  const updateFontSize = (key: string, value: string) => {
    setTypography((prev) => ({
      ...prev,
      fontSize: {
        ...prev.fontSize,
        [key]: value,
      },
    }));
  };

  const updateFontWeight = (key: string, value: string) => {
    setTypography((prev) => ({
      ...prev,
      fontWeight: {
        ...prev.fontWeight,
        [key]: value,
      },
    }));
  };

  const updateLineHeight = (key: string, value: string) => {
    setTypography((prev) => ({
      ...prev,
      lineHeight: {
        ...prev.lineHeight,
        [key]: value,
      },
    }));
  };

  const updateHeading = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', field: string, value: string) => {
    setTypography((prev) => ({
      ...prev,
      headings: {
        ...prev.headings,
        [level]: {
          ...prev.headings[level],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Typography</h2>

      {/* Font Families */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Font Families</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Font */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Font (Body)
            </label>
            <Select
              value={typography.fontFamily.primary}
              onChange={(e) => updateFontFamily('primary', e.target.value)}
              className="mb-3"
            >
              {availableFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </Select>
            <div
              className="p-4 border rounded-lg bg-gray-50"
              style={{ fontFamily: typography.fontFamily.primary }}
            >
              <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
              <p className="text-sm mt-2 text-gray-600">
                0123456789 !@#$%^&*()
              </p>
            </div>
          </div>

          {/* Heading Font */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <Select
              value={typography.fontFamily.heading}
              onChange={(e) => updateFontFamily('heading', e.target.value)}
              className="mb-3"
            >
              {availableFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </Select>
            <div
              className="p-4 border rounded-lg bg-gray-50"
              style={{ fontFamily: typography.fontFamily.heading }}
            >
              <p className="text-2xl font-bold">Sample Heading</p>
              <p className="text-xl font-semibold mt-2">Medium Heading</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Font Sizes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Font Sizes</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <Input
                type="text"
                value={value}
                onChange={(e) => updateFontSize(key, e.target.value)}
                placeholder="1rem"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <p style={{ fontSize: typography.fontSize.xs }}>Extra Small Text</p>
          <p style={{ fontSize: typography.fontSize.sm }}>Small Text</p>
          <p style={{ fontSize: typography.fontSize.base }}>Base Text</p>
          <p style={{ fontSize: typography.fontSize.lg }}>Large Text</p>
          <p style={{ fontSize: typography.fontSize.xl }}>Extra Large Text</p>
        </div>
      </Card>

      {/* Font Weights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Font Weights</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <Select
                value={value}
                onChange={(e) => updateFontWeight(key, e.target.value)}
              >
                {FONT_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <p style={{ fontWeight: typography.fontWeight.light }}>Light Weight</p>
          <p style={{ fontWeight: typography.fontWeight.normal }}>Normal Weight</p>
          <p style={{ fontWeight: typography.fontWeight.medium }}>Medium Weight</p>
          <p style={{ fontWeight: typography.fontWeight.semibold }}>Semibold Weight</p>
          <p style={{ fontWeight: typography.fontWeight.bold }}>Bold Weight</p>
        </div>
      </Card>

      {/* Line Heights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Line Heights</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(typography.lineHeight).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <Input
                type="text"
                value={value}
                onChange={(e) => updateLineHeight(key, e.target.value)}
                placeholder="1.5"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Heading Styles */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Heading Styles</h3>
        
        <div className="space-y-6">
          {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((level) => (
            <div key={level} className="border-b pb-6 last:border-b-0">
              <h4 className="font-medium mb-3 uppercase">{level}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <Input
                    type="text"
                    value={typography.headings[level].fontSize}
                    onChange={(e) => updateHeading(level, 'fontSize', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <Select
                    value={typography.headings[level].fontWeight}
                    onChange={(e) => updateHeading(level, 'fontWeight', e.target.value)}
                  >
                    {FONT_WEIGHTS.map((weight) => (
                      <option key={weight} value={weight}>
                        {weight}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Line Height
                  </label>
                  <Input
                    type="text"
                    value={typography.headings[level].lineHeight}
                    onChange={(e) => updateHeading(level, 'lineHeight', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div
                  style={{
                    fontFamily: typography.fontFamily.heading,
                    fontSize: typography.headings[level].fontSize,
                    fontWeight: typography.headings[level].fontWeight,
                    lineHeight: typography.headings[level].lineHeight,
                    letterSpacing: typography.headings[level].letterSpacing,
                  }}
                >
                  Sample {level.toUpperCase()} Heading
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Typography Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Full Preview</h3>
        
        <div
          className="prose max-w-none"
          style={{
            fontFamily: typography.fontFamily.primary,
            fontSize: typography.fontSize.base,
            lineHeight: typography.lineHeight.normal,
          }}
        >
          <h1 style={{
            fontFamily: typography.fontFamily.heading,
            fontSize: typography.headings.h1.fontSize,
            fontWeight: typography.headings.h1.fontWeight,
          }}>
            Main Heading (H1)
          </h1>
          
          <p>
            This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.
            The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit.
          </p>

          <h2 style={{
            fontFamily: typography.fontFamily.heading,
            fontSize: typography.headings.h2.fontSize,
            fontWeight: typography.headings.h2.fontWeight,
          }}>
            Section Heading (H2)
          </h2>
          
          <p>
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          <h3 style={{
            fontFamily: typography.fontFamily.heading,
            fontSize: typography.headings.h3.fontSize,
            fontWeight: typography.headings.h3.fontWeight,
          }}>
            Subsection Heading (H3)
          </h3>
          
          <ul>
            <li>List item one</li>
            <li>List item two</li>
            <li>List item three</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
