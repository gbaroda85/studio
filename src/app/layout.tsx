import type {Metadata, Viewport} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import AppLayout from '@/components/app-layout';
import {Toaster} from '@/components/ui/toaster';
import {LanguageProvider} from '@/contexts/language-context';
import Script from 'next/script';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#001D39' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'GR7 Tools - 100% Private Image & PDF Studio (No Upload)',
    template: '%s | GR7 Tools',
  },
  description: 'Fastest local browser tools. Compress images to 20kb/50kb for SSC & UPSC, resize photos, remove background, and merge files without server uploads. 100% Secure & Private.',
  metadataBase: new URL('https://www.gr7imagepdf.com'),
  alternates: {
    canonical: 'https://www.gr7imagepdf.com',
  },
  applicationName: 'GR7 Tools Hub',
  authors: [{ name: 'Gaurav S' }],
  creator: 'Gaurav S',
  publisher: 'GR7 Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    'merge pdf without uploading to server',
    'gr7 tools',
    'private image editor online'
  ],
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
    description: 'Fastest professional local browser tools for Images, PDFs and Calculators. No server storage, total privacy for your documents.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GR7 Tools Hub Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GR7 Tools - 100% Private Local Browser Toolkit',
    description: 'Edit, Compress and Convert Images & PDFs locally in your browser. No files are ever uploaded.',
    images: ['/opengraph-image'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Structured Data
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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GR7 Tools",
    "url": "https://www.gr7imagepdf.com",
    "logo": "https://www.gr7imagepdf.com/icon",
    "email": "gr7imagepdf@gmail.com",
    "description": "Professional suite of client-side web tools for image and PDF processing."
  };

  return (
    <html lang="en" suppressHydrationWarning className="h-full w-full overflow-x-hidden overflow-y-scroll scrollbar-gutter-stable">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Orbitron:wght@700;900&family=Plus+Jakarta+Sans:wght@500;700;800&family=Dancing+Script:wght@700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-body antialiased min-h-screen w-full flex flex-col m-0 p-0 overflow-x-hidden selection:bg-primary/20">
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
