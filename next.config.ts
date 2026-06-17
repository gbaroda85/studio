
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  serverExternalPackages: [
    '@imgly/background-removal', 
    '@huggingface/transformers', 
    'genkit',
    '@genkit-ai/google-genai',
    'pdfjs-dist',
    'tesseract.js',
    'pdf-lib',
    '@tensorflow/tfjs'
  ],
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
  experimental: {
    allowedDevOrigins: [
      '*.cloudworkstations.dev',
      '*.idx.google.com',
      'localhost:9002',
      '*.cluster-*.cloudworkstations.dev'
    ]
  }
};

export default nextConfig;
