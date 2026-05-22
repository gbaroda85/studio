
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundRemover from '@/components/background-remover';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'AI Background Remover - Remove BG from Photos Online',
  description: 'Professional AI tool to remove background from images instantly. Create high-definition passport photos and transparent PNGs.',
};

export const dynamic = 'force-dynamic';

const steps = [
  "Upload Image: Select an image with a clear subject by clicking the upload area or dragging it in.",
  "Optional Crop: Use 'Set Size & Crop' to align the face if making a passport photo.",
  "AI Removal: The tool will automatically extract the subject in high definition.",
  "Customise: Choose professional background colors (Blue/White) and add a border.",
  "Download: Click 'Download HD Photo' to save as a transparent or solid background PNG.",
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
        <HowToGuide title="AI Background Remover & ID Photo Maker" steps={steps} />
    </main>
  );
}
