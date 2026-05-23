import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Unzipper from '@/components/unzipper';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Unzip File Online - Extract ZIP Archives Safely and Privately',
  description: 'Extract contents from ZIP files instantly in your browser. No server uploads. 100% private and secure extraction tool.',
};

const steps = [
    "Upload: Drag and drop your .zip file.",
    "Process: The tool extracts contents locally in RAM.",
    "Download: Save individual files from the archive.",
];

export default function UnzipFilePage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=file">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <Unzipper />
        </div>
        <HowToGuide title="Unzipper Tool" steps={steps} />
    </main>
  );
}
