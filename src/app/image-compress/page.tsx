
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageCompressor from '@/components/image-compressor';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload Image: Drag and drop an image or click to select one.",
    "Adjust Settings: Use the controls to change the dimensions, format, and quality (for JPEG).",
    "Compress: Click the 'Apply & Compress' button to process the image.",
    "Review & Download: Compare the original and compressed images, check the savings, and click 'Download Image'.",
];

export default function ImageCompressPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <ImageCompressor />
        </div>
        <HowToGuide title="Image Compressor" steps={steps} />
    </main>
  );
}
