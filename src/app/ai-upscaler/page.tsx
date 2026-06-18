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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> NEURAL STUDIO
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                    AI Image <span className="text-gradient-hero">Upscaler</span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-xs md:text-sm">
                    Increase resolution and fix blurry photos with browser-side AI. 100% Private. No limits.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <AiUpscalerClient />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="AI Image Upscaler" steps={steps} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Professional Super-Resolution</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Stop using cloud upscalers that charge per credit. Our <strong>Neural Studio</strong> uses advanced edge-aware convolution to increase image size.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-cyan-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <Cpu className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">LOCAL INFERENCE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Processing runs on your GPU/CPU via TensorFlow.js. Your sensitive photos never leave your device.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Maximize className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">4K READY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Upscale small thumbnails into large, printable photos. Perfect for old family shots or blurry screenshots.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">PRIVACY ARCHITECTURE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">No accounts, no tracking, no server storage. The only truly private AI upscaler that works completely offline.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
