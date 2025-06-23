
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfSplitter from '@/components/pdf-splitter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload PDF: Choose the PDF file you want to split. The total number of pages will be shown.",
    "Enter Ranges: Specify pages to extract. e.g., '1-3' for a range, '5' for a single page, or combine them like '1-3, 5, 8'.",
    "Split: Click the 'Split PDF' button.",
    "Download: A new PDF with your selected pages will be created. Click 'Download Split PDF' to save it.",
];

export default function SplitPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PdfSplitter />
        </div>
        <HowToGuide title="PDF Splitter" steps={steps} />
    </main>
  );
}
