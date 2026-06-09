import { Metadata } from 'next';
import { FileOutput, Trophy } from 'lucide-react';
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
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> FORMAT STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Image to <span className="text-gradient-hero">PNG</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Convert any format to lossless PNG to maintain crystal clear quality.
                </p>
            </div>
            
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
