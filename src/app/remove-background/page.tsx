
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundRemover from '@/components/background-remover';
import { HowToGuide } from '@/components/how-to-guide';

export const dynamic = 'force-dynamic';

const steps = [
  "Upload Image: Select an image with a clear subject by clicking the upload area or dragging it in.",
  "Start Process: Click the 'Remove Background' button to start the AI process.",
  "Review Result: The AI will generate a new image with the background removed. Preview it next to the original.",
  "Download: Click 'Download Image' to save your new image with a transparent background (PNG).",
];

export default function RemoveBackgroundPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <BackgroundRemover />
        </div>
        <HowToGuide title="AI Background Remover" steps={steps} />
    </main>
  );
}
