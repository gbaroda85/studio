import { Metadata } from 'next';
import ImageConverter from '@/components/image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Image to PNG Converter - Convert JPG, WEBP to Transparent PNG Online',
  description: 'Convert any image format to lossless PNG. Maintain transparency and crystal clear document quality with local browser processing. 100% private.',
};

export default function ImageToPngPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <ImageConverter targetFormat="png" />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Image to PNG Converter" steps={[
                "Upload: Select a JPG, WEBP, or BMP file from your computer.",
                "Format: Make sure the output format is set to 'PNG'.",
                "Process: Click the conversion button to render pixels locally.",
                "Save: Download your high-clarity PNG file instantly."
            ]} />
        </div>
    </main>
  );
}
