
import { Metadata } from 'next';
import { Scissors, ShieldCheck, HelpCircle, LayoutGrid, MousePointer2 } from 'lucide-react';
import PdfSplitter from '@/components/pdf-splitter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Visual PDF Splitter - Extract & Split PDF Pages Online Privately',
  description: 'Visually select and extract specific pages from any PDF file. Features grid-preview selection and instant local processing. 100% private and secure.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/split-pdf' }
};

export default function SplitPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfSplitter />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 mx-auto">
            <HowToGuide title="Visual PDF Splitter" steps={[
                "Upload: Select a multi-page PDF from your device.",
                "Visual Grid: Every page will be rendered as a preview in the grid.",
                "Select: Click on the pages you want to keep or type ranges like '1-5'.",
                "Extract: Hit the extract button to create a new PDF instantly."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Scissors className="text-primary size-8" />
                        Precision Document Extraction
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard splitters make you guess page numbers. Our <strong>Visual Splitter</strong> lets you see exactly what you are extracting, making it perfect for legal docs, study materials, and complex bank statements.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <LayoutGrid className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Grid Preview</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Stop guessing! See page thumbnails to ensure you only extract the exact information you need.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <MousePointer2 className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Click Selection</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Toggle pages with a simple click. Our logic automatically builds the range string for you.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/50 transition-all">
                        <ShieldCheck className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Secure Sandbox</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Extraction happens 100% in your browser memory. Your sensitive pages are never uploaded.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">PDF Splitter FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I extract just one page from a huge PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Just click that specific page in our visual grid and hit "Extract". A new single-page PDF will be generated instantly for download.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does the split PDF lose quality?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. We use **High-Fidelity Re-encoding**. We preserve the original vector data and internal resources of the PDF, ensuring the extracted pages look identical to the original.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for legal or bank documents?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            This is the safest method available online. Because we use **Client-Side JS**, your files are processed in your computer's RAM and never uploaded to any server. Your data stays on your device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
