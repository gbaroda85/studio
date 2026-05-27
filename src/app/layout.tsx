import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import AppLayout from '@/components/app-layout';
import {Toaster} from '@/components/ui/toaster';
import {LanguageProvider} from '@/contexts/language-context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'GR7 Tools - 100% Private Image & PDF Utility Suite',
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
    siteName: 'GR7 Tools Hub',
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