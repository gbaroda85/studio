import { MetadataRoute } from 'next'

/**
 * @fileOverview Professional Robots.txt Generator for Next.js 15.
 * Uses an array for rules to ensure compatibility with internal Next.js array methods like .some().
 */

export default function robots(): MetadataRoute.Robots {
  const rules = [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/static/'],
    },
  ];

  // Defensive check to ensure rules is an array
  const safeRules = Array.isArray(rules) ? rules : [];

  return {
    rules: safeRules,
    sitemap: 'https://www.gr7imagepdf.com/sitemap.xml',
  }
}
