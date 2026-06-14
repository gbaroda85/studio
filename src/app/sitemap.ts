import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.gr7imagepdf.com';
  
  // All active tools paths for comprehensive indexing
  const highPriorityTools = [
    '/image-compress',
    '/image-resize',
    '/signature-resizer',
    '/marriage-biodata',
    '/passport-photo',
    '/passport-date-name',
    '/unlock-pdf',
    '/merge-pdf',
    '/remove-background',
    '/remove-signature',
    '/aadhaar-printer',
    '/image-to-pdf',
    '/image-to-text',
    '/barcode-generator',
    '/qr-code-generator',
    '/gst-calculator',
    '/gst-invoice',
    '/salary-slip',
    '/sip-calculator',
    '/fd-rd-calculator',
    '/income-tax-calculator',
    '/organize-pdf',
    '/mortgage-calculator'
  ];

  const otherTools = [
    '/lock-pdf',
    '/rotate-pdf',
    '/compress-pdf',
    '/split-pdf',
    '/crop-pdf',
    '/scan-to-pdf',
    '/document-scan',
    '/pdf-to-image',
    '/html-to-pdf',
    '/text-to-pdf',
    '/add-watermark',
    '/add-page-numbers',
    '/edit-pdf',
    '/standard-calculator',
    '/loan-calculator',
    '/age-calculator',
    '/percentage-calculator',
    '/fuel-cost-calculator',
    '/interest-calculator',
    '/sales-tax-calculator',
    '/acceleration-converter',
    '/area-converter',
    '/fuel-converter',
    '/pressure-converter',
    '/create-zip',
    '/unzip-file',
    '/crop-image',
    '/image-to-jpg',
    '/image-to-png',
    '/enhance-photo'
  ];

  const corePages = ['', '/tools', '/privacy-policy', '/terms-of-service'];

  const allRoutes = [...corePages, ...highPriorityTools, ...otherTools];

  return allRoutes.map((route) => {
    let priority = 0.8;
    if (route === '') priority = 1.0;
    if (route === '/tools') priority = 0.9;
    if (highPriorityTools.includes(route)) priority = 0.95;

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: priority,
    };
  });
}
