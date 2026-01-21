'use client';

/**
 * Hook pentru gestionarea blog-ului și articolelor
 * 
 * Acest hook oferă interfață completă pentru lucrul cu articolele de blog,
 * inclusiv listare, filtrare, căutare și gestionare categorii/tag-uri.
 * 
 * Features:
 * - Listare articole publice
 * - Filtrare după categorie și tag
 * - Căutare articole
 * - Gestionare paginare
 * - Obținere articol după slug
 * - Statistici vizualizări
 * 
 * @module hooks/useBlog
 * @see src/app/api/cms/blog/route.ts - API endpoint public
 * @see src/app/api/admin/cms/blog/route.ts - API endpoint admin
 */

import { useState, useEffect, useCallback } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  authorName: string;
  publishedAt: string;
  views: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseBlogReturn {
  /** Lista articolelor */
  posts: BlogPost[];
  /** Articolul curent (pentru pagină single post) */
  currentPost: BlogPost | null;
  /** Categoriile disponibile */
  categories: BlogCategory[];
  /** Tag-urile populare */
  popularTags: string[];
  /** Indicator de încărcare */
  isLoading: boolean;
  /** Eroare întâlnită */
  error: string | null;
  /** Încarcă lista de articole cu filtre */
  loadPosts: (filters?: BlogFilters) => Promise<void>;
  /** Încarcă un articol după slug */
  loadPostBySlug: (slug: string) => Promise<void>;
  /** Încarcă categoriile */
  loadCategories: () => Promise<void>;
  /** Încarcă tag-urile populare */
  loadPopularTags: () => Promise<void>;
  /** Resetează starea */
  reset: () => void;
}

/**
 * Hook pentru gestionarea blog-ului
 * 
 * @example
 * ```tsx
 * // Lista articole cu filtrare
 * function BlogList() {
 *   const { posts, isLoading, error, loadPosts, categories } = useBlog();
 * 
 *   useEffect(() => {
 *     loadPosts({ category: 'tutorial', limit: 10 });
 *   }, []);
 * 
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 * 
 *   return (
 *     <div>
 *       {posts.map(post => (
 *         <BlogCard key={post.id} post={post} />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * // Articol single
 * function BlogPost({ slug }: { slug: string }) {
 *   const { currentPost, isLoading, loadPostBySlug } = useBlog();
 * 
 *   useEffect(() => {
 *     loadPostBySlug(slug);
 *   }, [slug]);
 * 
 *   if (isLoading) return <Spinner />;
 *   if (!currentPost) return <NotFound />;
 * 
 *   return <BlogPostContent post={currentPost} />;
 * }
 * ```
 * 
 * @returns {UseBlogReturn} Obiect cu articole, categorii și metode de control
 */
export function useBlog(): UseBlogReturn {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Încarcă lista de articole cu filtre opționale
   */
  const loadPosts = useCallback(async (filters: BlogFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Construiește query string din filtre
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      const url = `/api/cms/blog${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load blog posts: ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load blog posts';
      setError(message);
      console.error('useBlog: Failed to load posts', err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Încarcă un articol după slug
   */
  const loadPostBySlug = useCallback(async (slug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentPost(null);

      const response = await fetch(`/api/cms/blog/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Articolul nu a fost găsit');
          return;
        }
        throw new Error(`Failed to load blog post: ${response.statusText}`);
      }

      const data = await response.json();
      setCurrentPost(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load blog post';
      setError(message);
      console.error('useBlog: Failed to load post', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Încarcă categoriile disponibile
   */
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/cms/blog/categories');
      
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('useBlog: Failed to load categories', err);
      setCategories([]);
    }
  }, []);

  /**
   * Încarcă tag-urile populare
   */
  const loadPopularTags = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/cms/blog/tags');
      
      if (!response.ok) {
        throw new Error('Failed to load tags');
      }

      const data = await response.json();
      setPopularTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('useBlog: Failed to load tags', err);
      setPopularTags([]);
    }
  }, []);

  /**
   * Resetează starea la valorile inițiale
   */
  const reset = useCallback(() => {
    setPosts([]);
    setCurrentPost(null);
    setCategories([]);
    setPopularTags([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    posts,
    currentPost,
    categories,
    popularTags,
    isLoading,
    error,
    loadPosts,
    loadPostBySlug,
    loadCategories,
    loadPopularTags,
    reset,
  };
}
