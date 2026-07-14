import { MetadataRoute } from 'next'

/**
 * @fileOverview Comprehensive Sitemap for Next.js 15.
 * Includes every valid utility page with prioritized static routes.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.gr7imagepdf.com';

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
    '/merge-audio',
    '/mp3-cutter',
    '/audio-converter',
    // Video Tools
    '/rotate-video',
    '/video-to-mp3',
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
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
