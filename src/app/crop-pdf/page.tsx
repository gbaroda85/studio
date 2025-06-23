
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfCropper from '@/components/pdf-cropper';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDF: Select a PDF file from your computer.",
    "Navigate Pages: Use the arrow buttons to find the page you want to crop.",
    "Select Area: Drag the selection box over the part of the page you want to keep.",
    "Crop Page: Click the 'Crop Page' button.",
    "Download: A new PDF containing only your cropped page will be created. Click 'Download' to save it.",
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
