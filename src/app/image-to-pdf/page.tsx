
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageToPdfConverter from '@/components/image-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload Images: Select one or more image files. You can add more files later.",
    "Review Order: The images will appear in the order they will be in the PDF.",
    "Convert: Click the 'Convert to PDF' button.",
    "Download: Click 'Download PDF' to save your combined document.",
];

export default function ImageToPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline">
                <Link href="/?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <ImageToPdfConverter />
        </div>
        <HowToGuide title="Image to PDF Converter" steps={steps} />
    </main>
  );
}
