
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfPageNumberer from '@/components/pdf-page-numberer';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
  "Upload PDF: Click the upload area or drag and drop your PDF file.",
  "Customize: Adjust the position, format, font size, and select the pages to number.",
  "Add Numbers: Click the 'Add Page Numbers' button.",
  "Download: Once processed, click 'Download PDF' to save your file with page numbers.",
];

export default function AddPageNumbersPage() {
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
            <PdfPageNumberer />
        </div>
        <HowToGuide title="Add Page Numbers Tool" steps={steps} />
    </main>
  );
}
