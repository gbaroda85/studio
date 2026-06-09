import { Metadata } from 'next';
import { Wand2, Trophy } from 'lucide-react';
import PhotoEnhancer from '@/components/photo-enhancer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'AI Photo Enhancer - Fix Blurry, Dark & Low-Quality Photos Online HD',
  description: 'Automatically improve photo quality, brightness, and sharpness using local AI. Professional enhancement with zero data risk. 100% private and free.',
};

export const dynamic = 'force-dynamic';

export default function EnhancePhotoPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> RESTORATION STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    AI Photo <span className="text-gradient-hero">Enhancer</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Automatically fix blurry, dark, and low-quality photos using local intelligence.
                </p>
            </div>
            
            <PhotoEnhancer />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
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
