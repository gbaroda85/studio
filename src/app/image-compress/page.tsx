import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Target, Layers, Wand2, Scaling, UploadCloud, Settings2, Zap, Download } from 'lucide-react';
import ImageCompressor from '@/components/image-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Bulk Image Optimizer - Reduce Multiple JPG/PNG to 20kb, 50kb Online',
  description: 'Professional bulk image optimization for SSC, UPSC, IBPS and Bank forms. Reduce hundreds of photos to exact KB size instantly without quality loss using smart adaptive scaling.',
};

export default function ImageCompressPage() {
  const deepSteps = [
    {
      title: "Batch Upload",
      description: "Upload up to 50 images at once. Our engine initializes a multi-threaded parallel processing queue in your browser for industrial-grade speed.",
      icon: "UploadCloud"
    },
    {
      title: "Set Optimization Limit",
      description: "Choose 'Target Size' for government forms (like 20KB or 50KB) or 'Quality Mode' for manual control. Our algorithm targets 90% of your limit for safety.",
      icon: "Settings2"
    },
    {
      title: "Adaptive Compression",
      description: "Click 'Optimize Now'. The engine intelligently balances JPEG sub-sampling with subtle pixel scaling to maintain face and text clarity at extremely small sizes.",
      icon: "Zap"
    },
    {
      title: "Smart ZIP Download",
      description: "Preview each optimized result side-by-side with the original. Download individual files or get the entire optimized batch in a secure ZIP archive instantly.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />
        
        <div className="w-full flex justify-center mb-12 px-4">
            <ImageCompressor />
        </div>

        <div className="w-full max-w-7xl space-y-16 px-4 mx-auto pb-24">
            <HowToGuide title="Bulk Image Optimizer" steps={deepSteps} />

            {/* Smart Compression Explanation */}
            <section className="bg-primary/5 p-12 rounded-[3.5rem] border-2 border-dashed border-primary/20 max-w-5xl mx-auto shadow-inner">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="size-24 rounded-[2rem] bg-primary/10 flex items-center justify-center shrink-0 shadow-lg">
                        <Scaling className="size-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Smart Adaptive Optimization</h2>
                        <p className="text-muted-foreground leading-relaxed font-semibold">
                            Compressing a 2MB photo to 50KB is mathematically difficult. Standard tools often create "banding" or "pixelation" on faces. Our <strong>GR7 Smart Engine</strong> automatically balances JPEG quality with subtle dimension resizing. If quality drops below the legibility floor, we slightly reduce the pixels to ensure your photo remains clear, crisp, and acceptable for government portals.
                        </p>
                    </div>
                </div>
            </section>

            {/* In-depth Content - ADSENSE READY */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Wand2 className="text-primary size-8" />
                        Professional Grade Batch Optimization
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard online tools limit you to one photo at a time or store your data on cloud servers. Our <strong>Bulk Image Optimizer</strong> allows you to process entire batches for <strong>SSC, UPSC, and IBPS</strong> portals with 100% privacy.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/40 transition-all">
                        <Layers className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Multi-Threading</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Queue up to 50 images. Our engine uses your device's multi-core CPU to process images in parallel, saving you hours of manual work.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all">
                        <Target className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Fixed KB Precision</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Perfect for job portals. Specify 20KB, 50KB, or 100KB, and our smart algorithm will hit the target size with the maximum possible clarity.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/40 transition-all">
                        <ShieldCheck className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Air-Gapped Privacy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Zero server uploads. Your private documents, ID cards, and photos are processed in your browser RAM and deleted immediately upon closing.</p>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="space-y-8 py-10 border-t pb-24">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image Optimization FAQs</h2>
                    <p className="text-muted-foreground font-medium opacity-60">Everything you need to know about our local optimization tech.</p>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why does my photo look blurry when I compress it too much?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            JPEG compression works by removing data. When you ask for an extremely small size (like 10KB from a 5MB original), the "quantization noise" becomes visible. Our **Smart Resize** logic helps mitigate this by reducing dimensions, ensuring the remaining pixels are higher quality.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I compress images for SSC or UPSC forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Government portals usually ask for photos under 50KB and signatures under 20KB. Select the **"Target Size"** tab, click the "50K" or "20K" preset, and upload your file. The tool will automatically find the best quality setting to stay strictly under that limit.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for sensitive data like ID cards?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, it is 100% safe. Our tool uses **Client-Side WASM Processing**. This means your images are never uploaded to any server. All the work happens inside your browser's temporary memory (RAM), making it more secure than any cloud-based alternative.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}