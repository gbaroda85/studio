import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap, HelpCircle, Target, Layers, Download, CheckCircle2 } from 'lucide-react';
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
                "Upload Images: Drag and drop multiple JPG, PNG, or WebP files.",
                "Set Target: Enter a fixed KB size (e.g., 50KB) or use manual quality.",
                "Processing: Our local AI engine optimizes all photos in one go.",
                "Download: Save individual results or get everything in a ZIP file."
            ]} />

            {/* In-depth Content */}
            <section className="grid md:grid-cols-2 gap-12 items-center py-10 border-t">
                <div className="space-y-6">
                    <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Target className="text-primary size-8" />
                        Why Use Bulk AI Compression?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        Standard online tools limit you to one photo at a time. Our <strong>Bulk Image Compressor</strong> allows you to process entire batches for <strong>SSC, UPSC, and IBPS</strong> portals. Whether you have 10 or 50 photos, our tool reduces them to exactly 20KB or 50KB while keeping text and faces sharp.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-primary/10">
                            <Layers className="text-blue-500 size-6" />
                            <div>
                                <h4 className="font-bold text-sm">Batch Processing</h4>
                                <p className="text-xs text-muted-foreground">Optimize your entire gallery in seconds.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-primary/10">
                            <ShieldCheck className="text-green-500 size-6" />
                            <div>
                                <h4 className="font-bold text-sm">No Server Uploads</h4>
                                <p className="text-xs text-muted-foreground">Your private photos never leave your device RAM.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
                    <Image 
                        src={placeholderData.image_tools.url} 
                        alt="Bulk Image Optimization" 
                        fill 
                        className="object-cover"
                        data-ai-hint={placeholderData.image_tools.hint}
                    />
                </div>
            </section>

            {/* Technical Details for AdSense */}
            <section className="space-y-8 py-10 border-t">
                <h2 className="text-3xl font-black uppercase tracking-tight text-center">Engine Specifications</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-3 p-6 bg-card rounded-2xl border shadow-sm">
                        <h3 className="font-black text-primary uppercase text-sm">Adaptive Quality</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Our algorithm performs iterative binary searches on quality levels to find the maximum possible clarity that fits under your target file size.</p>
                    </div>
                    <div className="space-y-3 p-6 bg-card rounded-2xl border shadow-sm">
                        <h3 className="font-black text-primary uppercase text-sm">Multi-Threading</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Utilizes your browser's worker threads to compress multiple images in parallel, ensuring native desktop-like speeds without any lag.</p>
                    </div>
                    <div className="space-y-3 p-6 bg-card rounded-2xl border shadow-sm">
                        <h3 className="font-black text-primary uppercase text-sm">300 DPI Rendering</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Maintains professional print resolution (300 DPI) for documents and IDs, making them valid for all official government portals.</p>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image Compression FAQs</h2>
                    <p className="text-muted-foreground">Everything you need to know about our local compression engine.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to upload my personal photos here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes, it is 100% safe. Our tool uses <strong>Client-Side Processing</strong>. This means your images are <strong>never uploaded</strong> to any server. All the work happens inside your browser's temporary memory (RAM).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I compress to exactly 20KB for SSC forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Simply select the "Fixed KB Size" tab, enter "20" in the input box, and upload your photo. The tool will automatically find the best quality setting to stay under 20KB while keeping your face recognizable.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does bulk compression slow down my computer?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            The processing happens in small chunks using your device's CPU. While it's very fast, we recommend processing up to 50 images at once for the smoothest experience on mobile devices.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which image formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            We support JPEG (JPG), PNG, and WebP. For government forms, we highly recommend selecting "JPEG" as the output format to ensure universal compatibility.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
