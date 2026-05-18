import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import AppLayout from '@/components/app-layout';
import {Toaster} from '@/components/ui/toaster';
import {LanguageProvider} from '@/contexts/language-context';

export const metadata: Metadata = {
  title: {
    default: 'GRs Multi Tools Kits Hub - Free Online Image & PDF Tools',
    template: '%s | GRs Multi Tools',
  },
  description: 'Free browser-based online tools for image compression, resizing, background removal, PDF merging, splitting, and security. 100% private and secure.',
  keywords: [
    'image compressor',
    'pdf merger',
    'passport photo maker',
    'online image resizer',
    'ocr converter',
    'remove background ai',
    'secure pdf tools',
    'file converter',
    'ssc photo resizer',
    'upsc signature tool',
    'aadhaar pdf unlocker'
  ],
  authors: [{ name: 'Gaurav S' }],
  creator: 'Gaurav S',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pi7csctools.netlify.app/',
    siteName: 'GRs Multi Tools Kits Hub',
    title: 'GRs Multi Tools Kits Hub - Fast, Private & Secure',
    description: 'Compress and convert images and PDFs with ease. No file uploads - everything stays in your browser.',
    images: [
      {
        url: 'https://picsum.photos/seed/toolshub/1200/630',
        width: 1200,
        height: 630,
        alt: 'GRs Multi Tools Kits Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GRs Multi Tools Kits Hub',
    description: 'Professional suite for merging, splitting, and securing documents and images.',
    images: ['https://picsum.photos/seed/toolshub/1200/630'],
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
        {/* Canonical link to help Google understand the main URL */}
        <link rel="canonical" href="https://pi7csctools.netlify.app/" />
      </head>
      <body className="font-body antialiased">
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
