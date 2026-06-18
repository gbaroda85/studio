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
                {/* PREMIUM CAPSULE HEADER */}
                <div className="inline-flex items-center p-1 md:p-1.5 pr-4 md:pr-6 rounded-full bg-[#e0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-500/20 shadow-sm mb-4 mx-auto group transition-all hover:scale-105">
                    <div className="size-7 md:size-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-lg shrink-0">
                        <X className="size-4 md:size-5 stroke-[4]" />
                    </div>
                    <span className="ml-3 font-black text-[10px] md:text-xs tracking-widest text-slate-800 dark:text-emerald-400 uppercase">
                        AI UPSCALER
                    </span>
                    <div className="w-px h-4 bg-slate-300/60 dark:bg-emerald-500/20 mx-4" />
                    <ChevronDown className="size-4 text-slate-800 dark:text-emerald-400 opacity-50" />
                </div>

                {/* 3D TITLE BAR */}
                <div className="w-full max-w-4xl mx-auto p-1 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-200 dark:bg-slate-800 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,1)] mb-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] md:rounded-[3.3rem] py-4 md:py-6 px-10 flex items-center justify-center border border-white/40 dark:border-white/5 shadow-inner transition-all hover:scale-[1.01]">
                        <h1 className="text-xl md:text-3xl lg:text-5xl font-jakarta font-black tracking-tighter uppercase leading-none">
                            AI Image <span className="text-gradient-hero">Upscaler Studio</span>
                        </h1>
                    </div>
                </div>

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
