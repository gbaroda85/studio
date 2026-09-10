import { MetadataRoute } from 'next'

/**
 * @fileOverview Dynamic robots.txt configuration for gr7imagepdf.com.
 * Points Googlebot directly to the dynamic sitemap and prevents crawl budget waste.
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.gr7imagepdf.com';

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
          '/*?*', // Prevent crawling search results/filters to save budget
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'], // Optional: Save server resources from AI scrapers
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
