import { MetadataRoute } from 'next'

/**
 * @fileOverview Infrastructure-Level Robots configuration.
 * Optimized for Googlebot rendering efficiency.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tools',
          '/_next/static/css/',
          '/_next/static/chunks/',
          '/_next/static/media/',
          '/icon.png',
          '/manifest.json',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/*?*', // Disallow crawling search/filter result strings to prevent duplicate content
        ],
      },
    ],
    sitemap: 'https://www.gr7imagepdf.com/sitemap.xml',
  }
}
