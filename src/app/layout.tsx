import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import AppLayout from '@/components/app-layout';
import {Toaster} from '@/components/ui/toaster';
import {LanguageProvider} from '@/contexts/language-context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'GR7 Tools - Fast & Private Image/PDF Toolkit',
    template: '%s | GR7 Tools',
  },
  description: '100% Private local browser tools. Compress images, resize photos for SSC/UPSC, remove background, unlock Aadhaar PDF, and more without server uploads.',
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
    'image to pdf',
    'remove background',
    'ssc photo resizer',
    'aadhaar pdf unlock',
    'signature background remover',
    'image compressor',
    'private pdf tools'
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
    siteName: 'GR7 Tools',
    title: 'GR7 Tools - Private & Fast Online Studio',
    description: 'Professional Image and PDF manipulation using high-performance local processing.',
    images: [
      {
        url: 'https://picsum.photos/seed/gr7tools/1200/630',
        width: 1200,
        height: 630,
        alt: 'GR7 Tools Hub',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full w-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&family=Orbitron:wght@700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon?v=25" />
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
