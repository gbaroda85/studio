import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import AppLayout from '@/components/app-layout';
import {Toaster} from '@/components/ui/toaster';
import {LanguageProvider} from '@/contexts/language-context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'GR7 Image PDF Tools - Free Online Photo & PDF Suite',
    template: '%s | GR7 Tools',
  },
  description: 'Fast, secure, and private browser-based online tools. Compress images, resize photos for SSC/UPSC, remove backgrounds, unlock Aadhaar PDF, and calculate EMI. 100% private - No files are uploaded to any server.',
  metadataBase: new URL('https://www.gr7imagepdf.com'),
  alternates: {
    canonical: 'https://www.gr7imagepdf.com',
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
    'image to pdf converter',
    'pdf to image converter',
    'split pdf pages',
    'merge multiple pdfs',
    'image compressor',
    'pdf merger',
    'online image resizer',
    'ocr converter',
    'remove background ai',
    'secure pdf tools',
    'ssc photo resizer',
    'upsc signature tool',
    'aadhaar pdf unlocker',
    'image to text converter',
    'extract text from image',
    'html to pdf online',
    'compress pdf to 100kb',
    'calculate loan emi',
    'age calculator online'
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
    siteName: 'GR7 Image PDF Tools Hub',
    title: 'GR7 Image PDF Tools Hub - Fast, Private & Secure Online Suite',
    description: 'Compress, convert, and edit images/PDFs with 100% privacy. One-click tools for SSC/UPSC/IBPS forms and Aadhaar unlocking.',
    images: [
      {
        url: 'https://picsum.photos/seed/gr7tools/1200/630',
        width: 1200,
        height: 630,
        alt: 'GR7 Tools Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GR7 Image PDF Tools Hub - All-in-One Utility Suite',
    description: 'Professional suite for Image to PDF, Split PDF, merging, and securing documents. Private local processing.',
    images: ['https://picsum.photos/seed/gr7tools/1200/630'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-5160508482904207',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&family=Orbitron:wght@700&display=swap"
          rel="stylesheet"
        />
        {/* Force naya favicon by using the same version tag */}
        <link rel="icon" href="/icon?v=25" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "GR7 Image PDF Tools Hub",
                "url": "https://www.gr7imagepdf.com",
                "description": "Free browser-based online tools for image compression, resizing, background removal, PDF merging, splitting, and security.",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Any",
                "author": {
                  "@type": "Person",
                  "name": "Gaurav S"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "url": "https://www.gr7imagepdf.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://www.gr7imagepdf.com/tools?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ]),
          }}
        />
      </head>
      <body className="font-body antialiased">
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
