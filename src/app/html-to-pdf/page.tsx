
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HtmlToPdfConverter from '@/components/html-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
  "Paste HTML: Write or paste your HTML code directly into the editor.",
  "Convert: Click the 'Convert to PDF' button to start the process.",
  "Preview: A preview of your PDF will be generated and displayed.",
  "Download: Click 'Download PDF' to save your new PDF file.",
];

export default function HtmlToPdfPage() {
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
            <HtmlToPdfConverter />
        </div>
        <HowToGuide title="HTML to PDF Converter" steps={steps} />
    </main>
  );
}
