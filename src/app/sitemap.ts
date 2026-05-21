import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.gr7imagepdf.com';
  
  const tools = [
    '',
    '/tools',
    '/image-compress',
    '/image-resize',
    '/crop-image',
    '/remove-background',
    '/remove-signature',
    '/enhance-photo',
    '/image-to-text',
    '/image-to-jpg',
    '/image-to-png',
    '/image-to-pdf',
    '/text-to-pdf',
    '/html-to-pdf',
    '/pdf-to-image',
    '/compress-pdf',
    '/merge-pdf',
    '/split-pdf',
    '/crop-pdf',
    '/scan-to-pdf',
    '/unlock-pdf',
    '/add-watermark',
    '/add-page-numbers',
    '/create-zip',
    '/unzip-file',
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
    '/pressure-converter'
  ];

  return tools.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}