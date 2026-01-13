/**
 * Blog Listing Page - Public
 */

import Link from 'next/link';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
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

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/cms/blog`, {
      cache: 'no-store', // TODO: Change to revalidate in production
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error('Failed to fetch blog posts:', err);
    return [];
  }
}

export const metadata = {
  title: 'Blog - sanduta.art',
  description: 'Articole, tutoriale și ghiduri despre produse personalizate',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600">
            Articole, tutoriale și ghiduri despre produse personalizate
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full cursor-pointer">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="h-48 bg-gray-100">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Category */}
                  <Badge value={post.category.name} className="mb-3" />

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishedAt).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Niciun articol publicat încă.</p>
          </div>
        )}
      </div>
    </div>
  );
}
