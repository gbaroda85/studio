
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfToWordConverter from '@/components/pdf-to-word-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const dynamic = 'force-dynamic';

const steps = [
    "Upload PDF: Click the upload area or drag and drop your PDF file.",
    "Automatic Conversion: The tool will automatically start converting the file to a DOCX document.",
    "Wait for Processing: Simple documents are fast, but complex ones may take a moment.",
    "Download: Once complete, click the 'Download .docx' button to save your file.",
];

export default function PdfToWordPage() {
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
            <PdfToWordConverter />
        </div>
        <HowToGuide title="PDF to Word Converter" steps={steps} />
    </main>
  );
}
