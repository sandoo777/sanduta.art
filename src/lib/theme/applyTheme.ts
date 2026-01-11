/**
 * Theme Application Utilities
 * Aplică tema pe frontend generând CSS variables
 */

import { useState, useEffect } from 'react';
import type { ThemeConfig, ThemeVariables } from '@/types/theme';

/**
 * Convertește ThemeConfig în CSS variables
 */
export function themeToVariables(theme: ThemeConfig): ThemeVariables {
  return {
    // Colors
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--color-info': theme.colors.info,

    // Background
    '--bg-primary': theme.colors.background.primary,
    '--bg-secondary': theme.colors.background.secondary,
    '--bg-tertiary': theme.colors.background.tertiary,

    // Surface
    '--surface-default': theme.colors.surface.default,
    '--surface-paper': theme.colors.surface.paper,
    '--surface-elevated': theme.colors.surface.elevated,

    // Text
    '--text-primary': theme.colors.text.primary,
    '--text-secondary': theme.colors.text.secondary,
    '--text-disabled': theme.colors.text.disabled,
    '--text-inverse': theme.colors.text.inverse,

    // Border
    '--border-default': theme.colors.border.default,
    '--border-light': theme.colors.border.light,
    '--border-dark': theme.colors.border.dark,

    // Typography
    '--font-primary': theme.typography.fontFamily.primary,
    '--font-heading': theme.typography.fontFamily.heading,
    '--font-size-xs': theme.typography.fontSize.xs,
    '--font-size-sm': theme.typography.fontSize.sm,
    '--font-size-base': theme.typography.fontSize.base,
    '--font-size-lg': theme.typography.fontSize.lg,
    '--font-size-xl': theme.typography.fontSize.xl,
    '--font-size-2xl': theme.typography.fontSize['2xl'],
    '--font-size-3xl': theme.typography.fontSize['3xl'],
    '--font-weight-light': theme.typography.fontWeight.light,
    '--font-weight-normal': theme.typography.fontWeight.normal,
    '--font-weight-medium': theme.typography.fontWeight.medium,
    '--font-weight-semibold': theme.typography.fontWeight.semibold,
    '--font-weight-bold': theme.typography.fontWeight.bold,
    '--line-height-tight': theme.typography.lineHeight.tight,
    '--line-height-normal': theme.typography.lineHeight.normal,
    '--line-height-relaxed': theme.typography.lineHeight.relaxed,

    // Layout
    '--header-height': theme.layout.header.height,
    '--container-max-width': theme.layout.container.maxWidth,
    '--container-padding': theme.layout.container.padding,
    '--spacing-xs': theme.layout.spacing.xs,
    '--spacing-sm': theme.layout.spacing.sm,
    '--spacing-md': theme.layout.spacing.md,
    '--spacing-lg': theme.layout.spacing.lg,
    '--spacing-xl': theme.layout.spacing.xl,
    '--spacing-2xl': theme.layout.spacing['2xl'],
    '--radius-sm': theme.layout.borderRadius.sm,
    '--radius-md': theme.layout.borderRadius.md,
    '--radius-lg': theme.layout.borderRadius.lg,
    '--radius-full': theme.layout.borderRadius.full,

    // Components
    '--button-radius': theme.components.button.borderRadius,
    '--button-padding': theme.components.button.padding,
    '--card-radius': theme.components.card.borderRadius,
    '--card-padding': theme.components.card.padding,
    '--input-radius': theme.components.input.borderRadius,
    '--input-padding': theme.components.input.padding,
    '--badge-radius': theme.components.badge.borderRadius,
    '--badge-padding': theme.components.badge.padding,
  };
}

/**
 * Aplică CSS variables în document
 */
export function applyTheme(theme: ThemeConfig): void {
  if (typeof window === 'undefined') return;

  const variables = themeToVariables(theme);
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Generează stylesheet complet din tema
 */
export function generateThemeStylesheet(theme: ThemeConfig): string {
  const variables = themeToVariables(theme);
  
  let css = ':root {\n';
  Object.entries(variables).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}\n\n';

  // Base styles
  css += `
body {
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

h1 {
  font-size: ${theme.typography.headings.h1.fontSize};
  font-weight: ${theme.typography.headings.h1.fontWeight};
  line-height: ${theme.typography.headings.h1.lineHeight};
  letter-spacing: ${theme.typography.headings.h1.letterSpacing};
}

h2 {
  font-size: ${theme.typography.headings.h2.fontSize};
  font-weight: ${theme.typography.headings.h2.fontWeight};
  line-height: ${theme.typography.headings.h2.lineHeight};
  letter-spacing: ${theme.typography.headings.h2.letterSpacing};
}

h3 {
  font-size: ${theme.typography.headings.h3.fontSize};
  font-weight: ${theme.typography.headings.h3.fontWeight};
  line-height: ${theme.typography.headings.h3.lineHeight};
  letter-spacing: ${theme.typography.headings.h3.letterSpacing};
}

/* Buttons */
.btn {
  border-radius: var(--button-radius);
  padding: var(--button-padding);
  font-weight: ${theme.components.button.fontWeight};
  text-transform: ${theme.components.button.textTransform};
  ${theme.components.button.shadow ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : ''}
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: var(--text-inverse);
}

/* Cards */
.card {
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  background-color: var(--surface-paper);
  ${theme.components.card.border ? 'border: 1px solid var(--border-default);' : ''}
  ${
    theme.components.card.shadow !== 'none'
      ? `box-shadow: ${
          {
            sm: '0 1px 2px rgba(0,0,0,0.05)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.1)',
          }[theme.components.card.shadow]
        };`
      : ''
  }
  ${theme.components.card.hoverEffect ? 'transition: transform 0.2s;' : ''}
}

${
  theme.components.card.hoverEffect
    ? `
.card:hover {
  transform: scale(1.02);
}
`
    : ''
}

/* Inputs */
input, textarea, select {
  border-radius: var(--input-radius);
  padding: var(--input-padding);
  border: ${theme.components.input.borderWidth} solid var(--border-default);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 ${theme.components.input.focusRing} var(--color-primary);
}

/* Badges */
.badge {
  border-radius: var(--badge-radius);
  padding: var(--badge-padding);
  font-size: ${theme.components.badge.fontSize};
  font-weight: ${theme.components.badge.fontWeight};
}

/* Layout */
.container {
  max-width: var(--container-max-width);
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
  margin: 0 auto;
}

header {
  height: var(--header-height);
  ${theme.layout.header.sticky ? 'position: sticky; top: 0;' : ''}
}
`;

  return css;
}

/**
 * Încarcă tema publicată de pe server
 */
export async function loadPublishedTheme(): Promise<ThemeConfig | null> {
  try {
    const response = await fetch('/api/admin/theme?version=published');
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.theme;
  } catch (error) {
    console.error('Failed to load theme:', error);
    return null;
  }
}

/**
 * Hook React pentru aplicare automată a temei
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    loadPublishedTheme().then((loadedTheme) => {
      if (loadedTheme) {
        setTheme(loadedTheme);
        applyTheme(loadedTheme);
      }
    });
  }, []);

  return theme;
}
