
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageResizer from '@/components/image-resizer';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload Image: Select the image you want to resize.",
    "Enter Dimensions: Input your desired width and/or height in pixels. Check 'Maintain aspect ratio' to avoid distortion.",
    "Choose Format: Select the output format (PNG, JPEG, or WEBP).",
    "Resize: Click the 'Resize Image' button.",
    "Download: Preview your resized image and click 'Download' to save it.",
];

export default function ImageResizePage() {
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
            <ImageResizer />
        </div>
        <HowToGuide title="Image Resizer" steps={steps} />
    </main>
  );
}
