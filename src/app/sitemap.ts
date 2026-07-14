import { MetadataRoute } from 'next'

/**
 * @fileOverview Comprehensive Sitemap for Next.js 15.
 * Includes every valid utility page with prioritized static routes and lastmod sync.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.gr7imagepdf.com';
  const lastModified = new Date();

  const coreTools = [
    '/image-compress',
    '/merge-pdf',
    '/aadhaar-printer',
    '/compress-pdf',
    '/unlock-pdf',
    '/image-to-text',
    '/passport-photo',
    '/document-scan'
  ];

  const secondaryTools = [
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
    '/ai-upscaler',
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
  ];

  const sitemaps: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/tools`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
  ];

  coreTools.forEach(route => {
    sitemaps.push({ url: `${baseUrl}${route}`, lastModified, changeFrequency: 'weekly', priority: 0.9 });
  });

  secondaryTools.forEach(route => {
    sitemaps.push({ url: `${baseUrl}${route}`, lastModified, changeFrequency: 'weekly', priority: 0.7 });
  });

  return sitemaps;
}
