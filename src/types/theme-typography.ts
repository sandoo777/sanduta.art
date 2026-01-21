/**
 * Theme - Typography Configuration
 * Tipuri pentru fonturilor și stiluri text
 */

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
