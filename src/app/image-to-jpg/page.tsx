import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageConverter from '@/components/image-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Image to JPG Converter - Convert PNG, WEBP, BMP to JPG Online',
  description: 'Convert any image format to standard high-quality JPG. Simple, fast, and secure local image conversion in your browser.',
};

const steps = [
    "Upload: Choose any image (PNG, WEBP, etc.).",
    "Format: Ensure JPG/JPEG is selected.",
    "Process: Click convert to transform locally.",
    "Save: Download your new JPG file.",
];

export default function ImageToJpgPage() {
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
            <ImageConverter targetFormat="jpeg" />
        </div>
        <HowToGuide title="Image to JPG Converter" steps={steps} />
    </main>
  );
}
