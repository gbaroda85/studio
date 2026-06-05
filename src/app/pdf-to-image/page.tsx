
import { Metadata } from 'next';
import { ImageIcon, ShieldCheck, HelpCircle, Sparkles, MonitorCheck, Layout, FileDigit, Settings2, Maximize, Zip } from 'lucide-react';
import PdfToImageConverter from '@/components/pdf-to-image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'High Quality PDF to Image Converter - Extract PDF Pages as HD JPG/PNG Online',
  description: 'Convert every page of your PDF into high-resolution JPG or PNG images. Features batch processing, ZIP download, and 300 DPI quality extraction. 100% private local tool.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/pdf-to-image' }
};

export default function PdfToImagePage() {
  const deepSteps = [
    {
      title: "Import PDF",
      description: "Upload your multi-page PDF. Our local engine instantly maps the internal structure and initializes a high-resolution render buffer in local RAM.",
      icon: "FileDigit"
    },
    {
      title: "Align & Frame",
      description: "Choose 'A4 Frame' or 'Raw Fit'. Use the studio panel to position content to the top, center, or bottom of each resulting image exactly.",
      icon: "Settings2"
    },
    {
      title: "HD 300DPI Render",
      description: "The engine renders every vector and font at 2.5x scale. This ensures text remains razor-sharp for professional printing or web use.",
      icon: "Sparkles"
    },
    {
      title: "Batch ZIP Save",
      description: "Download individual pages or click 'Extract All' to bundle all pages into an organized ZIP archive instantly. 100% private extraction.",
      icon: "MonitorCheck"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfToImageConverter />
        </div>

        <div className="w-full max-w-7xl space-y-16 px-4 mx-auto pb-24">
            <HowToGuide title="PDF to Image HD Studio" steps={deepSteps} />

            {/* AdSense Ready Deep Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <ImageIcon className="text-primary size-8" />
                        Professional Grade Page Extraction
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard converters often blur text. Our <strong>PDF to Image Studio</strong> uses a multi-threaded rendering engine that samples pages at 2.5x resolution, ensuring every character is sharp.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Layout className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Layout Studio</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Full control over how your pages are rendered. Center your content or align to edges with precision padding for a 'clean scan' look.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Sparkles className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">HD Rendering</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Engineered for 300 DPI equivalent quality. Perfect for professional presentations where text clarity is paramount.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">No uploads. No cloud. Every byte is processed in your device's RAM and cleared instantly upon closing the browser tab.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t pb-24">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">PDF Extraction FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will I lose text sharpness after conversion?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. Our tool renders the PDF using a high-density viewport scale (2.5x). This means the final image has more pixels than a standard screenshot, preserving original font sharpness.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between "Fit" and "A4 Frame" mode?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            **Fit mode** extracts the page exactly as its raw size. **A4 Frame mode** places content onto a standard 210x297mm canvas, allowing you to use alignment controls for a uniform look.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why download as a ZIP file?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Downloading dozens of pages one-by-one is tedious. Our **"Extract All"** feature bundles every rendered page into a single compressed ZIP archive instantly in your browser memory.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
