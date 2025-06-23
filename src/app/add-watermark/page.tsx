
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfWatermarker from '@/components/pdf-watermarker';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
  "Upload PDF: Click the upload area or drag and drop your PDF file.",
  "Enter Text: Type the text you want to use as a watermark.",
  "Customize: Adjust the position, opacity, font size, and rotation to your liking.",
  "Apply Watermark: Click the 'Apply Watermark' button.",
  "Download: Once processed, click 'Download PDF' to save your watermarked file.",
];

export default function AddWatermarkPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20">
                <Link href="/?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfWatermarker />
        </div>
        <HowToGuide title="Add Watermark Tool" steps={steps} />
    </main>
  );
}
