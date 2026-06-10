import { Metadata } from 'next';
import PdfRotator from '@/components/pdf-rotator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RotateCw, ShieldCheck, HelpCircle, LayoutGrid, MonitorCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rotate PDF Online - Permanently Rotate Individual or All Pages Privately',
  description: 'Easily rotate your PDF documents. Rotate individual pages or the entire file by 90, 180, or 270 degrees. 100% private local browser-based tool.',
};

export default function RotatePdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfRotator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="PDF Rotator Studio" steps={[
                "Upload: Select the PDF document you want to rotate.",
                "Visual Grid: See all pages as thumbnails in the studio workspace.",
                "Rotate Individual: Hover over any page to rotate it by 90 degrees.",
                "Bulk Rotate: Use the 'Rotate All' buttons in the sidebar for the entire doc.",
                "Save: Click 'Save PDF' to generate and download your corrected document."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Page Orientation
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Scanned documents are often sideways or upside down. Our <strong>Professional PDF Rotator</strong> allows you to fix page orientation with pixel-perfect accuracy using local RAM processing.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <RotateCw className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Full Control</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Rotate by 90, 180, or 270 degrees. Fix landscape or portrait orientation instantly.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <LayoutGrid className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Visual Previews</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Stop guessing. See exactly how each page looks before you save the final document.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your documents never leave your device. All rotation math happens 100% locally in your browser.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Rotation FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is the rotation permanent?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. Our tool modifies the internal **Rotation Metadata** of the PDF. When you save the file, it will open correctly in any PDF reader like Adobe Acrobat, Chrome, or on mobile devices.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it reduce PDF quality?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. We do not "screenshot" or rasterize your pages. We use high-fidelity vector manipulation which preserves all original text, fonts, and images perfectly.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I rotate just one page in a 100-page file?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. Our **Visual Grid** allows you to select and rotate individual pages without affecting the rest of the document.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
