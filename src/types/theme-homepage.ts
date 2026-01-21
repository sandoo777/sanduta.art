/**
 * Theme - Homepage Builder Blocks
 * Tipuri pentru blocuri de conținut homepage
 */

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
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCK CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

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
