
import { MetadataRoute } from 'next'

/**
 * @fileOverview Professional Sitemap Generator for Next.js 15.
 * Returns an array of URL objects to ensure SEO compatibility and fix "e.some" errors.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.gr7imagepdf.com';

  // Core Static Routes
  const routes = [
    '',
    '/tools',
    '/privacy-policy',
    '/terms-of-service',
    // PDF Tools
    '/organize-pdf',
    '/merge-pdf',
    '/rotate-pdf',
    '/lock-pdf',
    '/compress-pdf',
    '/edit-pdf',
    '/unlock-pdf',
    '/split-pdf',
    '/crop-pdf',
    '/pdf-to-image',
    '/html-to-pdf',
    '/text-to-pdf',
    '/add-watermark',
    '/add-page-numbers',
    '/document-scan',
    // Image Tools
    '/passport-date-name',
    '/enhance-photo',
    '/signature-resizer',
    '/image-to-pdf',
    '/image-compress',
    '/crop-image',
    '/image-resize',
    '/remove-background',
    '/remove-signature',
    '/passport-photo',
    '/image-to-jpg',
    '/image-to-png',
    '/image-to-text',
    '/marriage-biodata',
    '/ai-upscaler',
    // Audio Tools
    '/mp3-cutter',
    // Calculators
    '/salary-slip',
    '/gst-invoice',
    '/gst-calculator',
    '/sip-calculator',
    '/fd-rd-calculator',
    '/income-tax-calculator',
    '/standard-calculator',
    '/loan-calculator',
    '/age-calculator',
    '/percentage-calculator',
    '/fuel-cost-calculator',
    '/interest-calculator',
    '/sales-tax-calculator',
    '/mortgage-calculator',
    // Converters & File
    '/qr-code-generator',
    '/barcode-generator',
    '/acceleration-converter',
    '/area-converter',
    '/fuel-converter',
    '/pressure-converter',
    '/aadhaar-printer',
    '/create-zip',
    '/unzip-file',
    '/video-to-mp3',
  ];

  // Defensive check to ensure routes is an array
  const safeRoutes = Array.isArray(routes) ? routes : [];

  if (safeRoutes.length === 0) {
    return [];
  }

  const sitemapEntries: MetadataRoute.Sitemap = safeRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'monthly') as 'daily' | 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Ensure the return value is strictly an array to avoid "e.some" errors in Next.js 15
  return Array.isArray(sitemapEntries) ? sitemapEntries : [];
}
