
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Layout, AlignCenter, Hash } from 'lucide-react';
import { PdfPageNumbererClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF Online - Customize Position & Format Privately',
  description: 'Easily insert page numbers into your PDF documents. Choose positions, font sizes, and ranges. 100% private local browser-based tool.',
};

export default function AddPageNumbersPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfPageNumbererClient />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="PDF Page Numberer" steps={[
                "Upload: Select the PDF document you want to number.",
                "Position: Choose from Top/Bottom and Left/Center/Right options.",
                "Format: Use placeholders like '{page} of {total}' for dynamic numbering.",
                "Range: Choose to number all pages or a custom range (e.g., 2-10).",
                "Generate: Apply the numbers and download your organized PDF."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Hash className="text-primary size-8" />
                        Professional Document Organization
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Unnumbered documents are difficult to navigate. Our <strong>Page Numbering Studio</strong> allows you to add clear, consistent numbering to any PDF, making them ready for printing, submission, or academic use.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <AlignCenter className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">6 Positions</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Choose exactly where you want the numbers to appear - in the headers, footers, or corners.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Layout className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Smart Formats</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Supports dynamic formats. Display just the page number or the total page count for clarity.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your documents are processed locally in RAM. No server storage ensures 100% data privacy.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Numbering FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I skip the first page (cover page)?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Select **"Custom range"** in the pages to number setting and enter a range like `2-10` to start numbering from the second page onwards.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the numbers overlap with my content?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We use standard margin spacing to minimize overlap. If your content is too close to the edges, try using a smaller **font size** or switching from center to corner positioning.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for academic theses or reports?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. Academic and professional reports often require specific page numbering. Since we process files locally, your research and sensitive reports are never at risk of exposure.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
