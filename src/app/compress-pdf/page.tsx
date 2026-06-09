import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Target, TrendingDown, Zap } from 'lucide-react';
import PdfCompressor from '@/components/pdf-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'PDF Compress - Shrink PDF to 100kb, 200kb & 500kb Online (Lossless)',
  description: 'Reduce PDF file size without losing text clarity. Features targeted optimization for SSC, UPSC, and Bank portals. 100% secure local browser-based compression.',
};

export default function CompressPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfCompressor />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Pro PDF Optimizer" steps={[
                "Upload PDF: Drag and drop any large document into the compressor workspace.",
                "Target Size: Select 'Target Size' and enter 100KB or 200KB for government forms.",
                "Process: Our engine intelligently iterates to hit the target with max quality.",
                "Download: Save your optimized PDF file locally with zero data risk."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <TrendingDown className="text-primary size-8" />
                        Professional Size Management
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Uploading massive documents to job portals or emails is frustrating. Our <strong>Ultra PDF Optimizer</strong> uses advanced sub-sampling and JPEG-XL algorithms to shrink files up to 90% while maintaining crisp, readable text.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Target className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Target Hits</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Need exactly under 100KB? Our smart engine automatically calculates the best quality-to-size ratio to hit your target.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <ShieldCheck className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Local Privacy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your bank statements and ID cards never leave your device. Compression happens in browser RAM and is deleted on close.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/50 transition-all">
                        <Zap className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Native Speed</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Using WASM technology, we process files at hardware speed. No queues, no limits, no "cloud" delays.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">PDF Compression FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about shrinking documents.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the text become blurry after compression?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. Our "Clean-Text Engine" uses adaptive rendering. We heavily compress large images within the PDF while applying a "High-Pass" filter to text areas to ensure fonts remain crisp and readable even at 100KB sizes.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I compress for SSC or UPSC portals?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Most government portals ask for PDFs under **100KB or 200KB**. Use our "Target Size" mode, enter the limit (e.g., 100), and upload your file. The tool will automatically find the best settings to stay under that limit.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for Bank Statements?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. Unlike other "Online Compressors" that store your data to train AI models, **GR7 Tools** processes everything locally. Your private financial data never touches a server.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it work with encrypted PDFs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            If the PDF is password-protected, you must first use our **"Unlock PDF"** tool. Once the document is open, you can upload it here for optimization.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
