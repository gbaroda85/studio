import { Metadata } from 'next';
import ImageConverter from '@/components/image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Image to JPG Converter - Convert PNG, WEBP, BMP to JPG Online HD',
  description: 'Convert any image format to standard high-quality JPG instantly. Best for passport photos, web uploads, and social media with 100% privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-to-jpg' }
};

export default function ImageToJpgPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <ImageConverter targetFormat="jpeg" />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Image to JPG Converter" steps={[
                "Upload Photo: Select any image (PNG, WEBP, BMP) from your device.",
                "Verify Target: Ensure 'JPEG' is selected as the output format.",
                "Convert: Click 'START CONVERSION' to process the file locally in RAM.",
                "Download: Save your high-quality JPG result instantly."
            ]} />
        </div>
    </main>
  );
}
