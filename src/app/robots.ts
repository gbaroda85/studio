import { MetadataRoute } from 'next'

/**
 * @fileOverview Professional Robots.txt Generator for Next.js 15.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/static/'],
    },
    sitemap: 'https://www.gr7imagepdf.com/sitemap.xml',
  }
}
