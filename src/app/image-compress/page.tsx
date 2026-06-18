import { Metadata } from 'next';
import ImageCompressor from '@/components/image-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Scaling, Wand2, Layers, Target, ShieldCheck, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bulk Image Optimizer - Reduce Multiple JPG/PNG to 20kb, 50kb Online',
  description: 'Professional bulk image optimization for SSC, UPSC, IBPS and Bank forms. Reduce hundreds of photos to exact KB size instantly without quality loss using smart adaptive scaling.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-compress' }
};

export default function ImageCompressPage() {
  const deepSteps = [
    {
      title: "Batch Upload",
      description: "Upload up to 50 images. Our engine initializes parallel processing queue in your browser for industrial speed without server communication.",
      icon: "UploadCloud"
    },
    {
      title: "Set KB Target",
      description: "Choose 'Target Size' for govt forms (20KB/50KB). Our algorithm hits 90% of the limit for strict portal compliance.",
      icon: "Target"
    },
    {
      title: "Adaptive Scaling",
      description: "The engine intelligently balances JPEG sub-sampling with subtle pixel scaling to maintain face clarity at tiny file sizes.",
      icon: "Zap"
    },
    {
      title: "Secure ZIP Save",
      description: "Download individual files or get the entire batch in a secure ZIP archive instantly. All processing is 100% private in local RAM.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20 text-left">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />
        
        <div className="w-full flex justify-center mb-12 px-4">
            <ImageCompressor />
        </div>

        <div className="w-full max-w-7xl space-y-16 px-4 mx-auto pb-24">
            <HowToGuide title="Bulk Image Optimizer" steps={deepSteps} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Grade Batch Optimization
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard online tools limit you to one photo at a time. Our <strong>Bulk Image Optimizer</strong> allows you to process entire batches for portals with 100% privacy.
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
                                    <Layers className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">MULTI-THREADING</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Queue up to 50 images. Our engine uses your device's multi-core CPU to process images in parallel.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Target className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">FIXED KB PRECISION</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Specify 20KB, 50KB, or 100KB, and our smart algorithm will hit the target size with the maximum clarity.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">AIR-GAPPED PRIVACY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Zero server uploads. Your private documents are processed in your browser RAM and deleted immediately.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="space-y-8 py-10 border-t pb-24">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image Optimization FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why does my photo look blurry when I compress it too much?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            JPEG compression works by removing data. When you ask for an extremely small size (like 10KB from a 5MB original), our **Smart Resize** logic helps mitigate quality loss by reducing dimensions slightly to keep the remaining pixels crisp.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I compress images for SSC or UPSC forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Government portals usually ask for photos under 50KB and signatures under 20KB. Select the **"Target Size"** tab, click the "50K" or "20K" preset, and upload your file. The tool will automatically hit that limit strictly.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for sensitive data like ID cards?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, it is 100% safe. Our tool uses **Client-Side WASM Processing**. This means your images are never uploaded to any server. All work happens inside your browser's memory (RAM).
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
