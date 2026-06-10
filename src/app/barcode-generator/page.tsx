
import { Metadata } from 'next';
import { Barcode, ShieldCheck, HelpCircle, LayoutGrid, Scan, Maximize, Printer, Sparkles, Download, Zap } from 'lucide-react';
import BarcodeGenerator from '@/components/barcode-generator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional Barcode Generator - Create Scannable CODE128, EAN & UPC Online',
  description: 'Generate high-quality barcodes for free. Supports CODE128, EAN-13, UPC, and more. Download as PNG, SVG, or PDF. Batch processing and ZIP export included.',
  alternates: { canonical: '/barcode-generator' }
};

export default function BarcodeGeneratorPage() {
  const deepSteps = [
    {
      title: "Input Data",
      description: "Enter your product code, URL, or serial number. For batch processing, enter each code on a new line in the text area.",
      icon: "Type"
    },
    {
      title: "Format Selection",
      description: "Choose from industry-standard formats like CODE128 (general), EAN-13 (retail), or Pharmacode (medical).",
      icon: "Layers"
    },
    {
      title: "Studio Calibration",
      description: "Adjust bar width, height, and margins. Show or hide human-readable text and customize the font size for clarity.",
      icon: "Settings2"
    },
    {
      title: "Export & Save",
      description: "Download as high-res PNG for web, SVG for packaging, or A4 PDF for printing labels. All work happens in local RAM.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> INDUSTRIAL STUDIO
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                    Smart Barcode <span className="text-gradient-hero">Generator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Generate industry-standard barcodes instantly. Scannable, HD quality, and 100% private processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <BarcodeGenerator />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Barcode Generator" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Industrial Grade Scannable Output
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Our <strong>Professional Barcode Studio</strong> uses precise vector mapping to ensure your generated codes are 100% compliant with international standards and scannable by all laser and CCD scanners.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Barcode className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">10+ Formats</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Full support for CODE128, EAN, UPC, ITF, and specialized formats like Pharmacode and Codabar.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Zap className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Batch Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Need 100 barcodes? Just paste your list and download the entire stack as a clean ZIP archive instantly.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Server Leak</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All encoding logic runs locally on your CPU. Your product codes and inventory lists never leave your device.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Barcode FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which format should I use for retail?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            For standard retail products in India, Europe, or UK, use **EAN-13**. For the USA and Canada, use **UPC-A**. If you are managing internal inventory or logistics, **CODE128** is the most flexible choice.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the barcodes be sharp enough for printing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. We recommend downloading in **SVG format** for professional packaging or **PDF** for label printing. These are vector formats that remain perfectly sharp at any size. Our PNG export is also high-density (300DPI equivalent).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for private inventory lists?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. Unlike other "Barcode APIs", **GR7 Tools** is a client-side utility. Everything happens in your browser's RAM. We do not have a database and we never see your data.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
