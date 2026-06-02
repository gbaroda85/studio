import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.gr7imagepdf.com';
  
  // Array of all valid routes to ensure GSC discovery
  const routes = [
    '',
    '/tools',
    '/privacy-policy',
    '/terms-of-service',
    
    // Image Tools (High priority for indexing)
    '/image-compress',
    '/image-resize',
    '/marriage-biodata',
    '/crop-image',
    '/remove-background',
    '/remove-signature',
    '/enhance-photo',
    '/passport-photo',
    '/aadhaar-printer',
    '/image-to-text',
    '/image-to-jpg',
    '/image-to-png',
    '/image-to-pdf',
    
    // PDF Tools
    '/docx-to-pdf',
    '/lock-pdf',
    '/compress-pdf',
    '/merge-pdf',
    '/split-pdf',
    '/crop-pdf',
    '/scan-to-pdf',
    '/document-scan',
    '/unlock-pdf',
    '/pdf-to-image',
    '/html-to-pdf',
    '/text-to-pdf',
    '/add-watermark',
    '/add-page-numbers',
    '/edit-pdf',
    
    // Calculator Tools
    '/standard-calculator',
    '/loan-calculator',
    '/age-calculator',
    '/percentage-calculator',
    '/fuel-cost-calculator',
    '/interest-calculator',
    '/sales-tax-calculator',
    
    // Converter Tools
    '/acceleration-converter',
    '/area-converter',
    '/fuel-converter',
    '/pressure-converter',
    
    // File Tools
    '/create-zip',
    '/unzip-file'
  ];

  return routes.map((route) => {
    // Assign priorities based on page importance
    let priority = 0.8;
    if (route === '') priority = 1.0;
    if (route === '/tools') priority = 0.9;
    if (['/image-compress', '/merge-pdf', '/passport-photo', '/unlock-pdf', '/marriage-biodata'].includes(route)) priority = 0.95;

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: priority,
    };
  });
}
