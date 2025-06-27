import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageToTextConverter from '@/components/image-to-text-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const dynamic = 'force-dynamic';

const steps = [
  "Upload Image: Select an image containing text (like a screenshot or a scanned document).",
  "Extract Text: Click the 'Extract Text' button to start the AI-powered OCR process.",
  "Review & Copy: The extracted text will appear in the textbox. You can edit it or copy it to your clipboard.",
  "Convert Another: Click 'Start Over' to process a new image.",
];

export default function ImageToTextPage() {
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
            <ImageToTextConverter />
        </div>
        <HowToGuide title="AI Image to Text (OCR)" steps={steps} />
    </main>
  );
}
