import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Scan, Grid3X3, Maximize, Zap } from 'lucide-react';
import { PdfCropperClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Precise PDF Cropper - Crop PDF Page Margins & Areas Online Privately',
  description: 'Trim PDF margins or fix perspective with 4-dot scanner mode. Perfect for extracting charts, tables, or cleaning document photos locally in HD.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/crop-pdf' }
};

export default function CropPdfPage() {
  const steps = [
    "Upload PDF: Select a document from your device.",
    "Choose Mode: Use 'Rect' for margins or 'Scanner' for tilted photos.",
    "Select Area: Drag handles or 4-dots to cover the content you want to keep.",
    "Process: Click 'Crop Page' to generate the corrected document.",
    "Download: Save your perfectly trimmed PDF instantly with zero data risk."
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfCropperClient />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 mx-auto pb-20">
            <HowToGuide title="Professional PDF Cropper & Scanner" steps={steps} />

            {/* AdSense Deep Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Grid3X3 className="text-primary size-8" />
                        Next-Gen Document Alignment
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard PDF readers only let you view. Our <strong>Professional PDF Crop Studio</strong> features a built-in <strong>Homography Matrix Engine</strong>. Whether you need to trim white margins for a clean presentation or "scan" a tilted phone photo of a bill, we provide pixel-perfect accuracy.
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
                                    <Scan className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">Scanner Mode</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Fix perspective on document photos. Drag 4 independent dots to the corners of the paper to flatten it instantly.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Maximize className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Margin Trimmer</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Use Rectangular mode to cut unwanted white space from research papers, bank statements, and invoices.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% Private</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Processing happens in your browser RAM. Your sensitive legal and financial docs never leave your device.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Detail */}
            <section className="bg-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="size-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Why choose our Cropper?</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm font-medium uppercase opacity-70">
                            Unlike basic converters that rasterize every page to low quality, our **Rect Mode** preserves the original internal PDF vectors whenever possible. For **Scanner Mode**, we use high-density (300 DPI equivalent) rendering to ensure that even after perspective correction, the text remains crisp and readable for OCR and official submissions.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Cropping & Scanning FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">When should I use "Scanner Mode"?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Use **Scanner Mode** when you have a photo of a document taken at an angle (like a photo from a phone). Drag the 4 dots to the actual corners of the paper. The tool will "flatten" it so it looks like a professional top-down scan.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does cropping reduce the file size?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! By removing large white margins or unwanted page clutter, you can often reduce the final PDF size, making it easier to email or upload to portal sites like SSC or UPSC.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for bank statements and IDs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This tool uses **Client-Side JS Technology**. This means your files are NEVER uploaded to any server. All the cropping math happens inside your browser's memory and is cleared as soon as you close the tab.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the text remain sharp in Scanner Mode?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. We render the page at **2.5x resolution** before correction. This ensures that the transformed image retains high-fidelity details, making it perfect for documents containing small text or signatures.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
