import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WordToPdfConverter from '@/components/word-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
  "Upload DOCX: Select the Word document (.docx) you want to convert.",
  "Preview: Review the rendered content in the live preview window.",
  "Convert: Click the 'Convert to PDF' button to start the local generation.",
  "Download: Click 'Download PDF' to save your new high-quality document.",
];

export default function WordToPdfPage() {
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
            <WordToPdfConverter />
        </div>
        <HowToGuide title="Word to PDF Tool" steps={steps} />
    </main>
  );
}