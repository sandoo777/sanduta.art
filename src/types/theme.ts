/**
 * Theme Types
 * Tipuri pentru sistemul de theme customization
 */

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

// ============================================
// BRANDING
// ============================================

export interface BrandingConfig {
  siteName: string;
  tagline: string;
  logo: {
    main: string; // URL
    dark?: string;
    light?: string;
    favicon: string;
  };
  email: {
    senderName: string;
    senderEmail: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

// ============================================
// COLORS
// ============================================

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  surface: {
    default: string;
    paper: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    default: string;
    light: string;
    dark: string;
  };
}

// ============================================
// TYPOGRAPHY
// ============================================

export interface TypographyConfig {
  fontFamily: {
    primary: string; // Google Font name
    secondary?: string;
    monospace?: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  headings: {
    h1: HeadingStyle;
    h2: HeadingStyle;
    h3: HeadingStyle;
    h4: HeadingStyle;
    h5: HeadingStyle;
    h6: HeadingStyle;
  };
}

export interface HeadingStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

// ============================================
// LAYOUT
// ============================================

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

// ============================================
// COMPONENTS
// ============================================

export interface ComponentsConfig {
  button: ButtonStyle;
  card: CardStyle;
  input: InputStyle;
  badge: BadgeStyle;
  alert: AlertStyle;
  modal: ModalStyle;
}

export interface ButtonStyle {
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: number;
  shadow: string;
  hover: {
    scale: number;
    brightness: number;
  };
  variants: {
    primary: ComponentVariant;
    secondary: ComponentVariant;
    outline: ComponentVariant;
    ghost: ComponentVariant;
  };
}

export interface CardStyle {
  borderRadius: string;
  padding: string;
  shadow: string;
  border: string;
  backgroundColor: string;
  hover: {
    shadow: string;
    transform: string;
  };
}

export interface InputStyle {
  borderRadius: string;
  padding: string;
  fontSize: string;
  border: string;
  focusBorder: string;
  backgroundColor: string;
}

export interface BadgeStyle {
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: number;
}

export interface AlertStyle {
  borderRadius: string;
  padding: string;
  border: string;
  shadow: string;
}

export interface ModalStyle {
  borderRadius: string;
  padding: string;
  shadow: string;
  backdrop: string;
  maxWidth: string;
}

export interface ComponentVariant {
  background: string;
  color: string;
  border?: string;
}

// ============================================
// HOMEPAGE BUILDER
// ============================================

export interface HomepageBlock {
  id: string;
  type: BlockType;
  order: number;
  enabled: boolean;
  config: BlockConfig;
}

export type BlockType =
  | 'hero'
  | 'grid-banners'
  | 'featured-products'
  | 'categories'
  | 'testimonials'
  | 'text-image'
  | 'newsletter'
  | 'custom-html';

export interface BlockConfig {
  // Common
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  
  // Specific per block type
  [key: string]: any;
}

export interface HeroBlockConfig extends BlockConfig {
  title: string;
  subtitle: string;
  backgroundImage: string;
  overlay: boolean;
  overlayOpacity: number;
  cta: {
    text: string;
    link: string;
    style: 'primary' | 'secondary';
  };
  alignment: 'left' | 'center' | 'right';
  height: string;
}

export interface GridBannersConfig extends BlockConfig {
  banners: Array<{
    id: string;
    image: string;
    title: string;
    link: string;
  }>;
  columns: 2 | 3 | 4;
  gap: string;
}

export interface FeaturedProductsConfig extends BlockConfig {
  title: string;
  productIds: string[];
  columns: 3 | 4 | 5;
  showPrice: boolean;
  showRating: boolean;
}

export interface CategoriesConfig extends BlockConfig {
  title: string;
  categoryIds: string[];
  style: 'cards' | 'grid' | 'carousel';
}

export interface TestimonialsConfig extends BlockConfig {
  title: string;
  testimonials: Array<{
    id: string;
    text: string;
    author: string;
    rating: number;
    image?: string;
  }>;
  layout: 'carousel' | 'grid';
}

export interface TextImageConfig extends BlockConfig {
  title: string;
  text: string;
  image: string;
  imagePosition: 'left' | 'right';
  cta?: {
    text: string;
    link: string;
  };
}

export interface NewsletterConfig extends BlockConfig {
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  backgroundColor: string;
}

export interface CustomHtmlConfig extends BlockConfig {
  html: string;
}

// ============================================
// THEME VARIABLES (CSS Variables)
// ============================================

export interface ThemeVariables {
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
