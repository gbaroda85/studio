import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap, HelpCircle, Target, Layers, Download, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageCompressor from '@/components/image-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Bulk AI Image Compressor - Reduce Multiple JPG/PNG to 20kb, 50kb Online',
  description: 'Professional bulk image compression for SSC, UPSC, IBPS and Bank forms. Reduce hundreds of photos to exact KB size instantly without quality loss. 100% private local browser processing.',
};

export default function ImageCompressPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Image Tools
                </Link>
            </Button>
        </div>
        
        <div className="w-full flex justify-center mb-12">
            <ImageCompressor />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            {/* Guide Section */}
            <HowToGuide title="Bulk Image Compressor" steps={[
                "Upload Images: Drag and drop multiple JPG, PNG, or WebP files into the workspace.",
                "Set Target: Enter a fixed KB size (e.g., 20KB for SSC) or use manual quality percentages.",
                "Processing: Our local AI engine optimizes all photos in one go using browser threads.",
                "Download: Save individual results instantly or get everything in a secure ZIP file."
            ]} />

            {/* In-depth Content - ADSENSE READY */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Wand2 className="text-primary size-8" />
                        Professional Grade Batch Compression
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard online tools limit you to one photo at a time or store your data on cloud servers. Our <strong>Bulk Image Compressor</strong> allows you to process entire batches for <strong>SSC, UPSC, and IBPS</strong> portals with 100% privacy.
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

            {/* Technical Details */}
            <section className="space-y-10 py-10 border-t">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 group">
                        <Image 
                            src={placeholderData.image_tools.url} 
                            alt="Bulk Image Optimization" 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            data-ai-hint={placeholderData.image_tools.hint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                            <p className="text-white font-black text-xl uppercase tracking-tighter">Native Browser Performance</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase tracking-tight">The GR7 Compression Engine</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-muted/30 rounded-2xl">
                                <Zap className="text-yellow-500 size-6 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">Adaptive Quality Scaling</h4>
                                    <p className="text-xs text-muted-foreground">Uses a binary search algorithm to find the highest possible JPEG/WebP quality factor that remains under your specified KB limit.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-muted/30 rounded-2xl">
                                <Sparkles className="text-purple-500 size-6 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">Lanczos 3 Re-sampling</h4>
                                    <p className="text-xs text-muted-foreground">When resizing is needed, we use high-order interpolation to ensure text on documents remains readable even after heavy shrinking.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image Compression FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about our local optimization tech.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to upload my signature or ID cards here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, it is 100% safe. Our tool uses <strong>Client-Side Processing</strong>. This means your images are <strong>never uploaded</strong> to any server. All the work happens inside your browser's temporary memory (RAM). Even if you disconnect your internet, the tool will still work.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I compress images for SSC or UPSC forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Government portals usually ask for photos under 50KB and signatures under 20KB. Select the "Fixed KB Size" tab, enter "20" or "50", and upload your file. The tool will automatically find the best quality setting to stay under that limit.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why should I use WebP format instead of JPEG?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            WebP is a modern image format that provides superior lossless and lossy compression. It can make your images 30% smaller than JPEG without any visible loss in clarity. However, for government forms, always check if they accept WebP or strictly require JPEG.
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