/**
 * Theme Types - Index
 * Re-export toate tipurile theme din module separate
 * 
 * Acest fișier menține compatibilitatea cu import-urile existente
 * din codebase, în timp ce organizează tipurile în module logice.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ThemeConfig {
  id: string;
  version: number;
  branding: BrandingConfig;
  colors: ColorPalette;
  typography: TypographyConfig;
  layout: LayoutConfig;
  components: ComponentsConfig;
  homepage: HomepageBlock[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS FROM MODULES
// ═══════════════════════════════════════════════════════════════════════════

// Branding
export type { BrandingConfig } from './theme-branding';

// Colors
export type { ColorPalette } from './theme-colors';

// Typography
export type { TypographyConfig, HeadingStyle } from './theme-typography';

// Layout
export type { LayoutConfig } from './theme-layout';

// Components
export type {
  ComponentsConfig,
  ButtonStyle,
  CardStyle,
  InputStyle,
  BadgeStyle,
  AlertStyle,
  ModalStyle,
  ComponentVariant,
} from './theme-components';

// Homepage Builder
export type {
  HomepageBlock,
  BlockType,
  BlockConfig,
  HeroBlockConfig,
  GridBannersConfig,
  FeaturedProductsConfig,
  CategoriesConfig,
  TestimonialsConfig,
  TextImageConfig,
  NewsletterConfig,
  CustomHtmlConfig,
} from './theme-homepage';

// ═══════════════════════════════════════════════════════════════════════════
// THEME VARIABLES (CSS Variables)
// ═══════════════════════════════════════════════════════════════════════════

export interface ThemeVariables {
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
