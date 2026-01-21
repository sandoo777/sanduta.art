/**
 * Theme - Layout Configuration
 * Tipuri pentru layout (header, footer, spacing)
 */

export interface LayoutConfig {
  header: {
    sticky: boolean;
    height: string;
    logoPosition: 'left' | 'center' | 'right';
    menuStyle: 'horizontal' | 'hamburger' | 'mega';
    backgroundColor: string;
    textColor: string;
    shadow: boolean;
  };
  footer: {
    layout: 'simple' | 'columns' | 'centered';
    columns: number;
    backgroundColor: string;
    textColor: string;
    showSocial: boolean;
    copyright: string;
  };
  container: {
    maxWidth: string;
    padding: string;
  };
  spacing: {
    unit: number; // Base spacing unit (default: 8px)
    scale: number[]; // [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32]
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
}
