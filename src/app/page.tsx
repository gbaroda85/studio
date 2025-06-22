import {FeatureCard} from '@/components/feature-card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Crop,
  FileArchive,
  FileDigit,
  FileOutput,
  Image as ImageIcon,
  Lock,
  Merge,
  ScanLine,
  Shrink,
  Unlock,
  Scissors,
} from 'lucide-react';

const imageFeatures = [
  {
    href: '/image-compress',
    label: 'Image Compress',
    description: 'Reduce image file size without losing quality.',
    icon: Shrink,
  },
  {
    href: '/crop-image',
    label: 'Crop Image',
    description: 'Easily crop your images to the perfect size.',
    icon: Crop,
  },
  {
    href: '/image-to-jpg',
    label: 'Image to JPG',
    description: 'Convert various image formats to JPG.',
    icon: FileOutput,
  },
  {
    href: '/image-to-png',
    label: 'Image to PNG',
    description: 'Convert various image formats to PNG.',
    icon: FileOutput,
  },
  {
    href: '/image-to-pdf',
    label: 'Image to PDF',
    description: 'Convert images into a single PDF file.',
    icon: FileDigit,
  },
];

const pdfFeatures = [
  {
    href: '/pdf-to-image',
    label: 'PDF to Image',
    description: 'Extract all pages from a PDF as images.',
    icon: ImageIcon,
  },
  {
    href: '/compress-pdf',
    label: 'Compress PDF',
    description: 'Reduce the file size of your PDF documents.',
    icon: FileArchive,
  },
  {
    href: '/merge-pdf',
    label: 'Merge PDF',
    description: 'Combine multiple PDFs into one document.',
    icon: Merge,
  },
  {
    href: '/split-pdf',
    label: 'Split PDF',
    description: 'Extract specific pages from a PDF.',
    icon: Scissors,
  },
  {
    href: '/scan-to-pdf',
    label: 'Scan to PDF',
    description: 'Scan documents directly to a PDF file.',
    icon: ScanLine,
  },
  {
    href: '/protect-pdf',
    label: 'Protect PDF',
    description: 'Add a password to your PDF.',
    icon: Lock,
  },
  {
    href: '/unlock-pdf',
    label: 'Unlock PDF',
    description: 'Remove password protection from a PDF.',
    icon: Unlock,
  },
];

export default function Home() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8 max-w-2xl">
        <p className="mt-2 text-muted-foreground">
          Your all-in-one tool for file manipulation. Fast, private, and
          easy to use. All processing is done directly in your browser.
        </p>
      </div>

      <Tabs defaultValue="image">
        <TabsList className="grid w-full grid-cols-2 md:max-w-sm">
          <TabsTrigger value="image">Image Tools</TabsTrigger>
          <TabsTrigger value="pdf">PDF Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="image">
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {imageFeatures.map((feature) => (
              <FeatureCard
                key={feature.label}
                title={feature.label}
                description={feature.description}
                href={feature.href}
                icon={feature.icon}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="pdf">
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pdfFeatures.map((feature) => (
              <FeatureCard
                key={feature.label}
                title={feature.label}
                description={feature.description}
                href={feature.href}
                icon={feature.icon}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
