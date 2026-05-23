import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TextToPdfConverter from '@/components/text-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Text to PDF Converter - Create Clean PDF Documents Online',
  description: 'Convert plain text into professional PDF files. Customize fonts, sizes, and margins locally in your browser for 100% privacy.',
};

const steps = [
  "Enter Text: Paste or type your text into the editor.",
  "Customize: Choose your preferred font, size, and margins.",
  "Generate: Click the 'Create PDF' button.",
  "Download: Preview your document and save it to your device.",
];

export default function TextToPdfPage() {
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
            <TextToPdfConverter />
        </div>
        <HowToGuide title="Text to PDF Converter" steps={steps} />
    </main>
  );
}
