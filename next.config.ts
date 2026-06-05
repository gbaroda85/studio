import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  experimental: {
    // Explicitly exclude heavy packages from the serverless function bundle
    // This is the key fix for Vercel's 250MB limit error
    serverExternalPackages: [
      '@imgly/background-removal', 
      '@huggingface/transformers', 
      'genkit',
      '@genkit-ai/google-genai',
      'pdfjs-dist',
      'tesseract.js',
      'pdf-lib'
    ],
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
    // Handle top-level await for pdfjs-dist and other modern modules
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

export default nextConfig;
