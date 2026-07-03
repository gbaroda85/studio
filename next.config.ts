import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          // INDUSTRIAL SEO INFRASTRUCTURE HEADERS
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          {
            key: 'Vary',
            value: 'User-Agent',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          }
        ],
      },
    ];
  },
  experimental: {
    serverExternalPackages: ['@imgly/background-removal', '@huggingface/transformers', '@ffmpeg/ffmpeg', '@ffmpeg/util'],
    allowedDevOrigins: [
      '*.cloudworkstations.dev',
      '*.idx.google.com',
      'localhost:9002',
      '*.cluster-*.cloudworkstations.dev'
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pi7.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
};

export default nextConfig;
