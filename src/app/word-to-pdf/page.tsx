
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WordToPdfConverter from '@/components/word-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
  "Upload DOCX: Click to select or drag and drop your Word document (.docx).",
  "Convert: The tool will automatically start the conversion process.",
  "Preview & Download: A preview of the PDF will be shown. Click 'Download PDF' to save your file.",
];

export default function WordToPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <WordToPdfConverter />
        </div>
        <HowToGuide title="Word to PDF Converter" steps={steps} />
    </main>
  );
}
