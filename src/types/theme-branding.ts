/**
 * Theme - Branding Configuration
 * Tipuri pentru branding (logo, social media, email)
 */

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
