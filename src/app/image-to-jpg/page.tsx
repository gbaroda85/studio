
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageConverter from '@/components/image-converter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Upload Image: Choose any image file (like PNG, WEBP, etc.) to convert.",
    "Select Format: The format is pre-selected. You can change it if needed.",
    "Convert: Click the 'Convert to JPG' button.",
    "Download: Once the conversion is complete, click 'Download Image' to save your new JPG file.",
];

export default function ImageToJpgPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20">
                <Link href="/?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <ImageConverter targetFormat="jpeg" />
        </div>
        <HowToGuide title="Image to JPG Converter" steps={steps} />
    </main>
  );
}
