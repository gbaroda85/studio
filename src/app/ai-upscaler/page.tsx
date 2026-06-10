
import { Metadata } from 'next';
import { AiUpscalerClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles, Zap, ShieldCheck, Maximize, Cpu, Download } from 'lucide-react';

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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> NEURAL STUDIO
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                    AI Image <span className="text-gradient-hero">Upscaler</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Increase resolution and fix blurry photos with browser-side AI. 100% Private. No limits.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <AiUpscalerClient />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="AI Image Upscaler" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Professional Super-Resolution</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Stop using cloud upscalers that charge per credit. Our <strong>Neural Studio</strong> uses advanced edge-aware convolution to increase image size while actually adding detail and removing JPEG artifacts.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Cpu className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Local Inference</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Processing runs on your GPU/CPU via TensorFlow.js. Your sensitive photos never leave your device for maximum security.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Maximize className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">4K Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Upscale small thumbnails into large, printable photos. Perfect for old family shots or blurry screenshots.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Privacy Architecture</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">No accounts, no tracking, no server storage. The only truly private AI upscaler that works completely offline.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
