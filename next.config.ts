import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Output-Konfiguration für Vercel
  output: 'standalone',
  
  // Experimentelle Features für bessere Performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'next-auth'],
  },
  
  // Bundle-Optimierungen
  webpack: (config, { isServer }) => {
    // Tree shaking optimieren
    config.optimization.usedExports = true
    config.optimization.sideEffects = false

    // Chunk splitting optimieren
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            maxSize: 200000,
          },
          auth: {
            test: /[\\/]node_modules[\\/](next-auth|@auth)[\\/]/,
            name: 'auth',
            chunks: 'all',
            priority: 20,
            maxSize: 100000,
          },
          ui: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            maxSize: 150000,
          },
          hooks: {
            test: /[\\/]src[\\/]hooks[\\/]/,
            name: 'hooks',
            chunks: 'all',
            priority: 12,
            maxSize: 50000,
          },
        },
      }
    }

    // Weitere Optimierungen
    config.optimization.minimize = true
    config.optimization.concatenateModules = true

    return config
  },
  
  // Aggressives Caching für Vercel-Optimierung
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
      // Statische Assets - 1 Jahr Cache
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API-Routes - 5 Minuten Cache
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=300',
          },
        ],
      },
      // Statische Seiten - 1 Stunde Cache
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
