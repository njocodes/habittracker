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
  
  // Experimentelle Features für EXTREME Performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'next-auth', '@radix-ui/react-icons'],
  },
  
  // Turbopack-Konfiguration (Next.js 15+)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Compiler-Optimierungen für Production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  
  // Performance-Optimierungen
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // EXTREME Bundle-Optimierungen
  webpack: (config, { dev, isServer }) => {
    // EXTREME Performance Optimizations
    
    // Tree shaking optimieren
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    // Advanced chunk splitting für bessere Performance
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        maxSize: 150000, // Reduziert von 200KB
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
            maxSize: 100000, // Reduziert von 150KB
          },
          auth: {
            test: /[\\/]node_modules[\\/](next-auth|@auth)[\\/]/,
            name: 'auth',
            chunks: 'all',
            priority: 20,
            enforce: true,
            maxSize: 50000, // Reduziert von 100KB
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|@headlessui)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            enforce: true,
            maxSize: 80000, // Reduziert von 120KB
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 25,
            enforce: true,
            maxSize: 60000, // Reduziert von 100KB
          },
          next: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: 'next',
            chunks: 'all',
            priority: 30,
            enforce: true,
            maxSize: 120000, // Reduziert von 200KB
          },
          hooks: {
            test: /[\\/]src[\\/]hooks[\\/]/,
            name: 'hooks',
            chunks: 'all',
            priority: 5,
            enforce: true,
            maxSize: 30000, // Reduziert von 50KB
          },
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'components',
            chunks: 'all',
            priority: 5,
            enforce: true,
            maxSize: 60000, // Reduziert von 100KB
          },
        },
      };
    }

    // EXTREME Minimization und Optimierungen
    config.optimization.minimize = true;
    config.optimization.concatenateModules = true;
    config.optimization.mergeDuplicateChunks = true;
    config.optimization.flagIncludedChunks = true;
    config.optimization.providedExports = true;
    config.optimization.occurrenceOrder = true;
    config.optimization.realContentHash = true;

    // Module concatenation
    config.optimization.moduleIds = 'deterministic';
    config.optimization.chunkIds = 'deterministic';

    // Performance hints
    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 300000, // Reduziert von 512KB
      maxAssetSize: 300000, // Reduziert von 512KB
    };

    // Resolve optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    // Production-spezifische Optimierungen
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // EXTREME JavaScript Minification
      config.optimization.minimizer = [
        ...config.optimization.minimizer,
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ];
    }

    return config;
  },
  
  // Image-Optimierungen
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Preload critical resources
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },
  
  // EXTREME Caching für Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
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
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=31536000',
          },
        ],
      },
      // Images - 1 Jahr Cache
      {
        source: '/_next/image(.*)',
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
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
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
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
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