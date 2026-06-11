
import { Metadata } from 'next';
import PhotoEnhancer from '@/components/photo-enhancer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'AI Photo Enhancer - Fix Blurry, Dark & Low-Quality Photos Online HD',
  description: 'Automatically improve photo quality, brightness, and sharpness using local AI. Professional enhancement with zero data risk. 100% private and free.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/enhance-photo' }
};

export const dynamic = 'force-dynamic';

export default function EnhancePhotoPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
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
