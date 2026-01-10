/**
 * CMS Module
 * Pages, Blog, Banners, Media Library, SEO
 */

'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - PAGES
// ────────────────────────────────────────────────────────────────────────────────

export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PageBlock {
  id: string;
  type: 'text' | 'image' | 'gallery' | 'video' | 'quote' | 'list' | 'heading';
  content: any; // Specific to block type
  order: number;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML or JSON blocks
  blocks?: PageBlock[];
  headerImage?: string;
  status: PageStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImage?: string;
}

export interface CreatePageInput {
  title: string;
  slug: string;
  content: string;
  blocks?: PageBlock[];
  headerImage?: string;
  status?: PageStatus;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImage?: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - BLOG
// ────────────────────────────────────────────────────────────────────────────────

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId: string;
  category?: BlogCategory;
  tags: string[]; // Tag IDs
  authorId: string;
  authorName?: string;
  status: BlogStatus;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Metrics
  views?: number;
  shares?: number;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId: string;
  tags?: string[];
  status?: BlogStatus;
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - BANNERS
// ────────────────────────────────────────────────────────────────────────────────

export type BannerPosition = 
  | 'HOMEPAGE_HERO'
  | 'HOMEPAGE_GRID'
  | 'SIDEBAR'
  | 'PRODUCT_PAGE'
  | 'CHECKOUT';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  position: BannerPosition;
  order: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Metrics
  impressions?: number;
  clicks?: number;
  ctr?: number; // Click-through rate
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  position: BannerPosition;
  order?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - MEDIA LIBRARY
// ────────────────────────────────────────────────────────────────────────────────

export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';

export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: MediaType;
  mimeType: string;
  size: number; // bytes
  width?: number;
  height?: number;
  folderId?: string;
  folderName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  fileCount: number;
  createdAt: string;
}

export interface UploadMediaInput {
  file: File;
  folderId?: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// TYPES - SEO
// ────────────────────────────────────────────────────────────────────────────────

export interface SeoSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  favicon?: string;
  ogDefaultImage?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  robotsTxt: string;
  enableSitemap: boolean;
  updatedAt: string;
}

export interface UpdateSeoSettingsInput {
  siteName?: string;
  siteDescription?: string;
  siteUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string[];
  favicon?: string;
  ogDefaultImage?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  robotsTxt?: string;
  enableSitemap?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────────
// RICH TEXT EDITOR CONFIG
// ────────────────────────────────────────────────────────────────────────────────

export const EDITOR_TOOLBAR = [
  'bold', 'italic', 'underline', 'strikethrough',
  '|',
  'heading-1', 'heading-2', 'heading-3',
  '|',
  'ordered-list', 'unordered-list', 'blockquote',
  '|',
  'link', 'image', 'video',
  '|',
  'align-left', 'align-center', 'align-right',
  '|',
  'undo', 'redo',
];

// ────────────────────────────────────────────────────────────────────────────────
// HOOK - useCms
// ────────────────────────────────────────────────────────────────────────────────

export function useCms() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGES
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchPages = useCallback(async (): Promise<Page[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Fetching pages');
      const response = await fetch('/api/admin/cms/pages');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error fetching pages', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPageBySlug = useCallback(async (slug: string): Promise<Page | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Fetching page by slug', { slug });
      const response = await fetch(`/api/cms/pages/${slug}`);
      
      if (!response.ok) {
        throw new Error('Page not found');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error fetching page', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPage = useCallback(async (input: CreatePageInput): Promise<Page | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Creating page', { title: input.title });
      const response = await fetch('/api/admin/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create page');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error creating page', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePage = useCallback(async (id: string, updates: Partial<CreatePageInput>): Promise<Page | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Updating page', { id });
      const response = await fetch(`/api/admin/cms/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update page');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error updating page', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePage = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Deleting page', { id });
      const response = await fetch(`/api/admin/cms/pages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete page');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error deleting page', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // BLOG
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchBlogPosts = useCallback(async (): Promise<BlogPost[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Fetching blog posts');
      const response = await fetch('/api/admin/cms/blog');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error fetching blog posts', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlogPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Fetching blog post by slug', { slug });
      const response = await fetch(`/api/cms/blog/${slug}`);
      
      if (!response.ok) {
        throw new Error('Blog post not found');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error fetching blog post', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlogPost = useCallback(async (input: CreateBlogPostInput): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Creating blog post', { title: input.title });
      const response = await fetch('/api/admin/cms/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create blog post');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error creating blog post', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlogPost = useCallback(async (id: string, updates: Partial<CreateBlogPostInput>): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Updating blog post', { id });
      const response = await fetch(`/api/admin/cms/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error updating blog post', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlogPost = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Deleting blog post', { id });
      const response = await fetch(`/api/admin/cms/blog/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error deleting blog post', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlogCategories = useCallback(async (): Promise<BlogCategory[]> => {
    try {
      const response = await fetch('/api/admin/cms/blog/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (err) {
      logger.error('CMS', 'Error fetching blog categories', { error: err });
      return [];
    }
  }, []);

  const fetchBlogTags = useCallback(async (): Promise<BlogTag[]> => {
    try {
      const response = await fetch('/api/admin/cms/blog/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return await response.json();
    } catch (err) {
      logger.error('CMS', 'Error fetching blog tags', { error: err });
      return [];
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // BANNERS
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchBanners = useCallback(async (position?: BannerPosition): Promise<Banner[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Fetching banners', { position });
      const url = position 
        ? `/api/admin/cms/banners?position=${position}`
        : '/api/admin/cms/banners';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error fetching banners', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createBanner = useCallback(async (input: CreateBannerInput): Promise<Banner | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Creating banner', { title: input.title });
      const response = await fetch('/api/admin/cms/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create banner');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error creating banner', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBanner = useCallback(async (id: string, updates: Partial<CreateBannerInput>): Promise<Banner | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Updating banner', { id });
      const response = await fetch(`/api/admin/cms/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update banner');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error updating banner', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBanner = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Deleting banner', { id });
      const response = await fetch(`/api/admin/cms/banners/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error deleting banner', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // MEDIA LIBRARY
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchMedia = useCallback(async (folderId?: string): Promise<MediaFile[]> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Fetching media', { folderId });
      const url = folderId 
        ? `/api/admin/cms/media?folderId=${folderId}`
        : '/api/admin/cms/media';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error fetching media', { error: message });
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMedia = useCallback(async (input: UploadMediaInput): Promise<MediaFile | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Uploading media', { fileName: input.file.name });
      const formData = new FormData();
      formData.append('file', input.file);
      if (input.folderId) {
        formData.append('folderId', input.folderId);
      }
      
      const response = await fetch('/api/admin/cms/media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload media');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error uploading media', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMedia = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Deleting media', { id });
      const response = await fetch(`/api/admin/cms/media/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete media');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error deleting media', { error: message });
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMediaFolders = useCallback(async (): Promise<MediaFolder[]> => {
    try {
      const response = await fetch('/api/admin/cms/media/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      return await response.json();
    } catch (err) {
      logger.error('CMS', 'Error fetching media folders', { error: err });
      return [];
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // SEO
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchSeoSettings = useCallback(async (): Promise<SeoSettings | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Fetching SEO settings');
      const response = await fetch('/api/admin/cms/seo');
      
      if (!response.ok) {
        throw new Error('Failed to fetch SEO settings');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error fetching SEO settings', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSeoSettings = useCallback(async (updates: UpdateSeoSettingsInput): Promise<SeoSettings | null> => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('CMS', 'Updating SEO settings');
      const response = await fetch('/api/admin/cms/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update SEO settings');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('CMS', 'Error updating SEO settings', { error: message });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSitemap = useCallback(async (): Promise<boolean> => {
    try {
      logger.info('CMS', 'Generating sitemap');
      const response = await fetch('/api/admin/cms/sitemap', {
        method: 'POST',
      });
      return response.ok;
    } catch (err) {
      logger.error('CMS', 'Error generating sitemap', { error: err });
      return false;
    }
  }, []);

  return {
    loading,
    error,
    
    // Pages
    fetchPages,
    fetchPageBySlug,
    createPage,
    updatePage,
    deletePage,
    
    // Blog
    fetchBlogPosts,
    fetchBlogPostBySlug,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    fetchBlogCategories,
    fetchBlogTags,
    
    // Banners
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    
    // Media
    fetchMedia,
    uploadMedia,
    deleteMedia,
    fetchMediaFolders,
    
    // SEO
    fetchSeoSettings,
    updateSeoSettings,
    generateSitemap,
  };
}
