
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfToImageConverter from '@/components/pdf-to-image-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'PDF to Image Converter - Extract Pages as JPG/PNG',
  description: 'Convert every page of your PDF into high-quality JPG or PNG images. Fast extraction without uploading files to any server.',
};

const steps = [
    "Upload PDF: Select the PDF you want to convert.",
    "Choose Format: Select whether you want PNG or JPEG images.",
    "Process: The tool will automatically extract each page as a separate image.",
    "Download: You can download individual images or click 'Download All (.zip)' to get all images in a single archive.",
];

export default function PdfToImagePage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfToImageConverter />
        </div>
        <HowToGuide title="PDF to Image Converter" steps={steps} />
    </main>
  );
}
