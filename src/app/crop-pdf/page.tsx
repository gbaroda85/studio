
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfCropper from '@/components/pdf-cropper';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Crop PDF Online - Trim PDF Page Margins Privately',
  description: 'Remove unwanted margins or select specific areas of your PDF pages. Fast, secure, and works locally without uploading files.',
};

const steps = [
    "Upload PDF: Select a file from your device.",
    "Select Area: Drag handles to crop a specific page.",
    "Apply: Click 'Crop Page' to process locally.",
    "Download: Save your cropped PDF document.",
];

export default function CropPdfPage() {
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
            <PdfCropper />
        </div>
        <HowToGuide title="PDF Cropper" steps={steps} />
    </main>
  );
}
