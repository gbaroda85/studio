import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import AppLayout from '@/components/app-layout';
import {Toaster} from '@/components/ui/toaster';
import {LanguageProvider} from '@/contexts/language-context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'GR7 Tools - 100% Private Image & PDF Studio (No Upload)',
    template: '%s | GR7 Tools',
  },
  description: 'Fastest local browser tools. Compress images to 20kb/50kb for SSC & UPSC, resize photos, remove background, unlock Aadhaar PDF, and merge files without server uploads. 100% Secure & Private.',
  metadataBase: new URL('https://www.gr7imagepdf.com'),
  icons: {
    icon: [
      { url: '/icon?v=25', type: 'image/png' },
      { url: '/icon?v=25', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icon?v=25', type: 'image/png' },
    ],
  },
  keywords: [
    'ssc photo signature resizer',
    'compress image to 20kb online',
    'compress image to 50kb online',
    'aadhaar pdf password remover',
    'bank statement password unlocker',
    'upsc image resizer tool',
    'ibps photo signature compressor',
    'remove background from signature online',
    'online marriage biodata maker free',
    'passport photo maker india online',
    'merge pdf without uploading to server',
    'image to pdf converter high quality',
    'gr7 tools',
    'private image editor online'
  ],
  authors: [{ name: 'Gaurav S' }],
  creator: 'Gaurav S',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'GR7 Tools',
    statusBarStyle: 'default',
    capable: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.gr7imagepdf.com',
    siteName: 'GR7 Tools Hub',
    title: 'GR7 Tools - 100% Private Online Image & PDF Studio',
    description: 'Professional Image and PDF manipulation using high-performance local processing. No server storage, total privacy for SSC, UPSC and Banking documents.',
    images: [
      {
        url: 'https://picsum.photos/seed/gr7tools/1200/630',
        width: 1200,
        height: 630,
        alt: 'GR7 Tools Hub Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GR7 Tools - 100% Private Local Browser Toolkit',
    description: 'Edit, Compress and Convert Images & PDFs locally in your browser. No files are ever uploaded.',
    images: ['https://picsum.photos/seed/gr7tools/1200/630'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data for Google (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GR7 Tools",
    "url": "https://www.gr7imagepdf.com",
    "description": "100% Private local browser tools for Images, PDFs, and Calculators. Specialized for SSC, UPSC, and Banking application forms.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.gr7imagepdf.com/tools?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GR7 Image & PDF Tools Hub",
    "operatingSystem": "All",
    "applicationCategory": "MultimediaApplication",
    "description": "A suite of high-performance image and PDF tools that work locally in the browser for maximum privacy. Includes SSC/UPSC resizers and Aadhaar tools.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "Image Compression, PDF Merging, Background Removal, Aadhaar Printing, Passport Photo Making, SSC Photo Resizing"
  };

  return (
    <html lang="en" suppressHydrationWarning className="h-full w-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Orbitron:wght@700;900&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon?v=25" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className="font-body antialiased min-h-screen w-full flex flex-col m-0 p-0 overflow-x-hidden">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5160508482904207"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
