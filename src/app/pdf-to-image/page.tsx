import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ImageIcon, ShieldCheck, Zap, HelpCircle, FileArchive, Target, Layers, Sparkles, MonitorCheck, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfToImageConverter from '@/components/pdf-to-image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'High Quality PDF to Image Converter - Extract PDF Pages as HD JPG/PNG Online',
  description: 'Convert every page of your PDF into high-resolution JPG or PNG images. Features batch processing, ZIP download, and 300 DPI quality extraction. 100% private local tool.',
};

export default function PdfToImagePage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to PDF Tools
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <PdfToImageConverter />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="PDF to Image HD Studio" steps={[
                "Upload: Select the PDF document you want to extract images from.",
                "Select Page: Click on any page in the grid to configure its layout.",
                "Alignment: Use the sidebar to set Top, Middle, or Bottom positioning.",
                "Format: Choose between Lossless PNG or Optimized JPEG.",
                "Download: Save individual pages or get all images in a single ZIP bundle."
            ]} />

            {/* AdSense Ready Deep Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <ImageIcon className="text-primary size-8" />
                        Professional Grade Page Extraction
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard converters often blur text during extraction. Our <strong>PDF to Image Studio</strong> uses a multi-threaded rendering engine that samples pages at 2.5x resolution, ensuring every character and pixel is sharp.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Layout className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Layout Studio</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Full control over how your pages are rendered. Center your content or align to edges with precision padding.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Sparkles className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">HD Rendering</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Engineered for 300 DPI equivalent quality. Perfect for use in professional presentations, websites, or reports.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">No uploads. No cloud. Every byte is processed in your device's RAM and cleared instantly upon closing.</p>
                    </div>
                </div>
            </section>

            {/* Technical Detail */}
            <section className="bg-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MonitorCheck className="size-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Why use padding & alignment?</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            When converting PDF pages for web use, standard extraction can leave content looking "cramped." Our <strong>Pro Studio</strong> allows you to add virtual padding. By selecting <strong>"Top" or "Bottom"</strong> alignment, you can position the PDF content on a standard A4-ratio canvas, making the exported images look like professional scans or document photos ready for official uploads.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">PDF Extraction FAQs</h2>
                    <p className="text-muted-foreground font-medium">Common questions about image extraction quality.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will I lose text sharpness after conversion?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. Our tool renders the PDF using a high-density viewport scale (2.5x). This means the final PNG/JPG has more pixels than a standard screenshot, preserving the original sharpness of fonts and diagrams for high-quality printing.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between "Fit" and "Pad" mode?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            **Fit mode** rips the page exactly as it is. **Pad mode** (Original) places the page content onto a standard document canvas, allowing you to use the **Top/Center/Bottom** alignment features for a more "scanned" look.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I extract images from a password-protected PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            You must unlock the PDF first. Use our **"Unlock PDF"** tool to remove the password, then upload the unlocked file here to extract your images.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why download as a ZIP file?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            If your PDF has many pages, downloading them one by one is tedious. Our **"Download All"** feature bundles every page into a single compressed ZIP archive, saving you time and keeping your downloads folder organized.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
