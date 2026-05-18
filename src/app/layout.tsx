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
  description: 'Free browser-based online tools for image compression, resizing, background removal, PDF merging, splitting, and security. Professional suite including Image to Text OCR, HTML to PDF, Passport Photo Maker, SSC/UPSC Photo Resizer, Aadhaar PDF Unlocker, and financial calculators. 100% private and secure.',
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
    'aadhaar pdf unlocker',
    'image to text converter',
    'extract text from image',
    'html to pdf online',
    'split pdf pages',
    'compress pdf to 100kb',
    'merge multiple pdfs',
    'scan document to pdf',
    'online photo enhancer',
    'remove signature from image',
    'zip file creator',
    'unzip files online',
    'calculate loan emi',
    'age calculator online',
    'percentage calculator',
    'area converter',
    'pressure converter',
    'fuel cost calculator',
    'sales tax calculator',
    'indian govt job photo resizer',
    'ssc signature tool',
    'upsc photo tool',
    'ibps photo resizer',
    'convert image to jpg',
    'convert image to png',
    'text to pdf converter',
    'add watermark to pdf',
    'add page numbers to pdf'
  ],
  authors: [{ name: 'Gaurav S' }],
  creator: 'Gaurav S',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pi7csctools.netlify.app/',
    siteName: 'GRs Multi Tools Kits Hub',
    title: 'GRs Multi Tools Kits Hub - Fast, Private & Secure Online Tools',
    description: 'Compress and convert images and PDFs with ease. Pro tools for SSC/UPSC forms, Aadhaar unlocking, and AI background removal. No file uploads - everything stays in your browser.',
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
    title: 'GRs Multi Tools Kits Hub - All-in-One Utility Suite',
    description: 'Professional suite for merging, splitting, and securing documents and images. Private local processing.',
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
