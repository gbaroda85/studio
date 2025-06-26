
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoEnhancer from '@/components/photo-enhancer';
import { HowToGuide } from '@/components/how-to-guide';

export const dynamic = 'force-dynamic';

const steps = [
  "Upload Photo: Select any photo you want to improve.",
  "Start Enhancing: Click the 'Enhance Photo' button to let the AI work its magic.",
  "Compare: See a side-by-side comparison of your original and the new, enhanced photo.",
  "Download: Click 'Download Image' to save the improved version.",
];

export default function EnhancePhotoPage() {
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
            <PhotoEnhancer />
        </div>
        <HowToGuide title="AI Photo Enhancer" steps={steps} />
    </main>
  );
}
