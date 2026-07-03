import { MetadataRoute } from 'next'

/**
 * @fileOverview Infrastructure-Level Robots configuration.
 * FIX: Allowing Googlebot to access /_next/ is CRITICAL for modern SEO rendering.
 * Modern search engines need access to JS/CSS assets to generate the visual snapshot.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
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
        ],
      },
    ],
    sitemap: 'https://www.gr7imagepdf.com/sitemap.xml',
  }
}
