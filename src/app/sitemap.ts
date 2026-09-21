
import { MetadataRoute } from 'next'

/**
 * @fileOverview Dynamic Sitemap Generator for gr7imagepdf.com
 * Requirements:
 * 1. Includes all 58+ tool routes.
 * 2. Dynamically sets lastmod to current timestamp for freshness signals.
 * 3. Priority mapping: 1.0 for home, 0.8 for tools.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.gr7imagepdf.com';
  const currentDate = new Date();

  // Primary Landing Pages (Priority 1.0)
  const mainRoutes = [
    '',
    '/tools',
  ];

  // Utility Tool Pages (Priority 0.8)
  const toolRoutes = [
    '/image-compress',
    '/merge-pdf',
    '/aadhaar-printer',
    '/compress-pdf',
    '/unlock-pdf',
    '/image-to-text',
    '/passport-photo',
    '/document-scan',
    '/passport-date-name',
    '/enhance-photo',
    '/signature-resizer',
    '/image-to-pdf',
    '/crop-image',
    '/image-resize',
    '/remove-background',
    '/remove-signature',
    '/image-to-jpg',
    '/image-to-png',
    '/marriage-biodata',
    '/merge-audio',
    '/mp3-cutter',
    '/audio-converter',
    '/rotate-video',
    '/video-to-mp3',
    '/salary-slip',
    '/gst-invoice',
    '/gst-calculator',
    '/sip-calculator',
    '/fd-rd-calculator',
    '/income-tax-calculator',
    '/cpc-arrears-calculator',
    '/loan-calculator',
    '/age-calculator',
    '/percentage-calculator',
    '/fuel-cost-calculator',
    '/interest-calculator',
    '/sales-tax-calculator',
    '/mortgage-calculator',
    '/qr-code-generator',
    '/barcode-generator',
    '/acceleration-converter',
    '/area-converter',
    '/fuel-converter',
    '/pressure-converter',
    '/create-zip',
    '/unzip-file',
    '/text-to-pdf',
    '/add-watermark',
    '/add-page-numbers',
    '/pdf-to-image',
    '/html-to-pdf',
    '/crop-pdf',
    '/split-pdf',
    '/edit-pdf',
    '/rotate-pdf',
    '/standard-calculator'
  ];

  // Policy Pages (Priority 0.3)
  const policyRoutes = [
    '/privacy-policy',
    '/terms-of-service',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add Main Routes
  mainRoutes.forEach(route => {
    sitemapEntries.push({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // Add Tool Routes
  toolRoutes.forEach(route => {
    sitemapEntries.push({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Add Policy Routes
  policyRoutes.forEach(route => {
    sitemapEntries.push({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    });
  });

  return sitemapEntries;
}
