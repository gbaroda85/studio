import { Metadata } from 'next';
import PhotoEnhancer from '@/components/photo-enhancer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Photo Enhancer - Fix Blurry, Dark & Low-Quality Photos Online HD',
  description: 'Automatically improve photo quality, brightness, and sharpness using local AI. Professional enhancement with zero data risk. 100% private and free.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/enhance-photo' }
};

export const dynamic = 'force-dynamic';

export default function EnhancePhotoPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Photo Enhancer Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Improve brightness, contrast and quality instantly. 100% Private local RAM processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PhotoEnhancer />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="AI Photo Enhancer" steps={[
                "Upload: Choose a dark, blurry, or low-resolution photo.",
                "Auto-Enhance: One-click fix for brightness and color balance.",
                "Manual Refine: Fine-tune contrast and sharpness using precision sliders.",
                "Sharpness Boost: Apply neural edge sharpening to fix blur.",
                "Export: Save your HD result directly to your device."
            ]} />
        </div>
    </main>
  );
}
