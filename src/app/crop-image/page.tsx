
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageCropper from '@/components/image-cropper';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Smart Image Cropper - Crop, Rotate & Fix Perspective Online',
  description: 'Advanced image cropping tool. Fix tilted documents, crop photos to exact ratios, and export in high quality. 100% secure local processing.',
};

const steps = [
    "Upload: Select an image from your device.",
    "Adjust: Drag handles to select area or use scanner mode.",
    "Edit: Rotate or flip if needed.",
    "Download: Save your perfectly cropped image.",
];

export default function CropImagePage() {
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
            <ImageCropper />
        </div>
        <HowToGuide title="Image Cropper" steps={steps} />
    </main>
  );
}
