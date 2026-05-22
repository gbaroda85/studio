
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ZipCreator from '@/components/zip-creator';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Create ZIP Online - Compress Multiple Files into Archive',
  description: 'Bundle and compress multiple files into a single ZIP archive instantly. Secure, fast, and works entirely in your browser memory.',
};

const steps = [
    "Add Files: Drag and drop files into the upload area, or click to select multiple files.",
    "Review Files: Your selected files will be listed. You can add more or remove them as needed.",
    "Create Archive: Click the 'Create Zip' button.",
    "Download: Once the zip archive is created, click 'Download Zip' to save it.",
];

export default function CreateZipPage() {
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
            <ZipCreator />
        </div>
        <HowToGuide title="Zip Creator" steps={steps} />
    </main>
  );
}
