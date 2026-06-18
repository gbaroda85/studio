import { Metadata } from 'next';
import { AiUpscalerClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles, Zap, ShieldCheck, Maximize, Cpu, Download, X, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Image Upscaler - Upscale to 2x & 4x Online Free (No Limits)',
  description: 'Instantly upscale and enhance your images with AI. 100% private browser-based processing. Fix blurry photos and increase resolution to 4K locally.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/ai-upscaler' }
};

export default function AiUpscalerPage() {
  const steps = [
    {
      title: "Neural Upload",
      description: "Select any JPG, PNG or WEBP image. Our local AI engine initializes a GPU-accelerated buffer in your RAM to handle high-res inference.",
      icon: "UploadCloud"
    },
    {
      title: "Scale Calibration",
      description: "Choose between 2x or 4x scale. Our ESRGAN-compatible model analyzes texture patterns to reconstruct lost pixels with 99% accuracy.",
      icon: "Maximize"
    },
    {
      title: "Studio Enhancement",
      description: "Use the live comparison slider to check edge sharpening and noise reduction. All processing happens 100% offline on your device.",
      icon: "Sparkles"
    },
    {
      title: "Sanitized Save",
      description: "Export your high-resolution result as a WebP optimized file. Everything remains 100% private with no server uploads.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        AI Image Upscaler
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-xl mx-auto text-xs md:text-sm">
                    Increase resolution and fix blurry photos with browser-side AI. 100% Private. No limits.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <AiUpscalerClient />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="AI Image Upscaler" steps={steps} />
        </div>
    </main>
  );
}
