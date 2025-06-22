import {FeatureCard} from '@/components/feature-card';
import {
  Crop,
  FileArchive,
  FileDigit,
  FileOutput,
  Image as ImageIcon,
  Merge,
  ScanLine,
  Shrink,
} from 'lucide-react';

const features = [
  {
    href: '/image-compress',
    label: 'Image Compress',
    description: 'Reduce the file size of your images without losing quality.',
    icon: Shrink,
  },
  {
    href: '#',
    label: 'Crop Image',
    description: 'Easily crop your images to the perfect size.',
    icon: Crop,
  },
  {
    href: '#',
    label: 'Image to JPG',
    description: 'Convert various image formats to JPG.',
    icon: FileOutput,
  },
  {
    href: '#',
    label: 'Image to PNG',
    description: 'Convert various image formats to PNG.',
    icon: FileOutput,
  },
  {
    href: '#',
    label: 'Image to PDF',
    description: 'Convert your images into a single PDF file.',
    icon: FileDigit,
  },
  {
    href: '#',
    label: 'PDF to Image',
    description: 'Extract images from your PDF files.',
    icon: ImageIcon,
  },
  {
    href: '#',
    label: 'Compress PDF',
    description: 'Reduce the file size of your PDF documents.',
    icon: FileArchive,
  },
  {
    href: '#',
    label: 'Merge PDF',
    description: 'Combine multiple PDF files into one document.',
    icon: Merge,
  },
  {
    href: '#',
    label: 'Scan to PDF',
    description: 'Scan documents directly to a PDF file.',
    icon: ScanLine,
  },
];

export default function Home() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to ShrinkRay
        </h1>
        <p className="text-muted-foreground">
          Your all-in-one tool for file manipulation.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard
            key={feature.href}
            title={feature.label}
            description={feature.description}
            href={feature.href}
            icon={feature.icon}
          />
        ))}
      </div>
    </main>
  );
}
