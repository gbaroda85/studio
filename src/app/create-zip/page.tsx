
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ZipCreator from '@/components/zip-creator';
import { HowToGuide } from '@/components/how-to-guide';

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
            <Button asChild variant="outline">
                <Link href="/?tab=file">
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
