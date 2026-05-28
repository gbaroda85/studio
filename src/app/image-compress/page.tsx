
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Target, Layers, Wand2, Scaling } from 'lucide-react';
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
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />
        
        <div className="w-full flex justify-center mb-12 px-4">
            <ImageCompressor />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 mx-auto">
            {/* Guide Section */}
            <HowToGuide title="Bulk Image Optimizer" steps={[
                "Upload Images: Drag and drop multiple JPG, PNG, or WebP files into the workspace.",
                "Set Target: Enter a fixed KB size (e.g., 20KB for SSC) or use manual quality percentages.",
                "Processing: Our local optimization engine optimizes all photos in one go using browser threads.",
                "Download: Save individual results instantly or get everything in a secure ZIP file."
            ]} />

            {/* Smart Compression Explanation */}
            <section className="bg-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Scaling className="size-10 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Smart Adaptive Optimization</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Compressing a 2MB photo to 100KB is mathematically difficult. Standard tools often create "banding" or "pixelation" on faces. Our <strong>GR7 Smart Engine</strong> automatically balances JPEG quality with subtle dimension resizing. If quality drops too low, we slightly reduce the pixels to ensure your photo remains clear, crisp, and acceptable for government portals.
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
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Batch Workspace</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Queue up to 50 images at once. Our engine uses multi-threading to process images in parallel, saving you hours of manual work.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all">
                        <Target className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Fixed KB Targets</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Perfect for government job portals. Specify 20KB, 50KB, or 100KB, and our smart algorithm will hit the target with max clarity.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/40 transition-all">
                        <ShieldCheck className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Local Privacy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Zero server uploads. Your private documents, ID cards, and photos are processed in your browser RAM and deleted immediately.</p>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image Optimization FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about our local optimization tech.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why does my photo look blurry when I compress it too much?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            JPEG compression works by removing data. When you ask for an extremely small size (like 10KB from a 5MB original), the "noise" becomes visible. Our <strong>Smart Resize</strong> logic helps mitigate this by reducing dimensions, but there is always a physical limit to how much data can be removed before quality drops.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I compress images for SSC or UPSC forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Government portals usually ask for photos under 50KB and signatures under 20KB. Select the "Fixed KB Size" tab, enter "20" or "50", and upload your file. The tool will automatically find the best quality setting to stay under that limit.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for upload my signature here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, it is 100% safe. Our tool uses <strong>Client-Side Processing</strong>. This means your images are <strong>never uploaded</strong> to any server. All the work happens inside your browser's temporary memory (RAM).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the maximum number of images I can process?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We recommend processing up to 50 images at once for the best performance. Since the processing uses your computer's CPU, larger batches might slow down older mobile devices.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
