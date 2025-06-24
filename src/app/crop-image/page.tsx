
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageCropper from '@/components/image-cropper';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload Image: Select an image from your device by clicking the upload area or dragging it in.",
    "Select Area: Drag the handles on the image to select the area you want to keep.",
    "Choose Format: Select your desired output format (JPEG, PNG, or WEBP).",
    "Crop: Click the 'Crop Image' button.",
    "Download: Preview your result and click 'Download' to save the cropped image.",
];

export default function CropImagePage() {
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
            <ImageCropper />
        </div>
        <HowToGuide title="Image Cropper" steps={steps} />
    </main>
  );
}
