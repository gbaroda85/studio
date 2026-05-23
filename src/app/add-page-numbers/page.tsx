import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfPageNumberer from '@/components/pdf-page-numberer';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF Online - Customize Position & Format',
  description: 'Easily insert page numbers into your PDF documents. Choose positions, font sizes, and ranges. 100% private browser-based tool.',
};

const steps = [
  "Upload PDF: Select your PDF document.",
  "Customize: Adjust the position, format, and font size.",
  "Add Numbers: Click 'Add Page Numbers' to process locally.",
  "Download: Save your file with page numbers added.",
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
