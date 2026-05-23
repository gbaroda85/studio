import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageConverter from '@/components/image-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Image to PNG Converter - Convert JPG to Transparent PNG Online',
  description: 'Convert JPG, WEBP, or BMP images to high-quality PNG. Keep documents clear and professional with local browser processing.',
};

const steps = [
    "Upload: Select your image (JPG, BMP, etc.).",
    "Target: Choose PNG as output format.",
    "Convert: Click to process instantly in RAM.",
    "Save: Download your high-quality PNG.",
];

export default function ImageToPngPage() {
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
            <ImageConverter targetFormat="png" />
        </div>
        <HowToGuide title="Image to PNG Converter" steps={steps} />
    </main>
  );
}
