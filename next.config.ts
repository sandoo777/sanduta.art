import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Production-ready configuration */
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.sanduta.art',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Security headers
  headers: async () => [
    {
      // Apply security headers only to page routes, not static assets
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
    {
      // Explicitly set correct MIME type for JS static chunks
      source: '/_next/static/chunks/:path*.js',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript; charset=utf-8',
        },
      ],
    },
    {
      // Explicitly set correct MIME type for CSS static files
      source: '/_next/static/css/:path*.css',
      headers: [
        {
          key: 'Content-Type',
          value: 'text/css; charset=utf-8',
        },
      ],
    },
  ],

  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'recharts',
      'date-fns',
    ],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Bundle analyzer (optional, commented out)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.alias['@'] = path.resolve(__dirname, 'src');
  //   }
  //   return config;
  // },
};

export default nextConfig;
