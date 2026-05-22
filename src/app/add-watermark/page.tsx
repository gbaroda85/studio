
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfWatermarker from '@/components/pdf-watermarker';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF Online - Protect Your Documents Fast',
  description: 'Add custom text watermarks to your PDF files. Control opacity, rotation, and position. Secure local browser-based processing.',
};

const steps = [
  "Upload PDF: Select the file you want to protect.",
  "Enter Text: Type the watermark text (e.g., 'CONFIDENTIAL').",
  "Customize: Adjust opacity, font size, and position.",
  "Apply: Click 'Apply Watermark' to process locally.",
  "Download: Save your watermarked document.",
];

export default function AddWatermarkPage() {
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
            <PdfWatermarker />
        </div>
        <HowToGuide title="Add Watermark Tool" steps={steps} />
    </main>
  );
}
