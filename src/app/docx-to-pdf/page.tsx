import { Metadata } from 'next';
import { FileText, ShieldCheck, HelpCircle, Zap, Layout, FileDigit } from 'lucide-react';
import DocxToPdf from '@/components/docx-to-pdf';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Word to PDF Converter - Convert DOCX to PDF Online Free (HD)',
  description: 'Convert Word (.docx) documents to high-quality PDF files instantly. 100% private local browser processing. No file size limits and no server uploads.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/docx-to-pdf' }
};

export default function DocxToPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <DocxToPdf />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 mx-auto">
            <HowToGuide title="Word to PDF Converter" steps={[
                "Upload: Select a .docx or .doc file from your computer or mobile.",
                "Convert: Click 'Convert to PDF' to start the local transformation.",
                "Process: Our engine maps Word styles to a high-resolution PDF canvas.",
                "Save: Your professional PDF will download automatically once ready."
            ]} />

            {/* AdSense Ready Deep Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <FileDigit className="text-primary size-8" />
                        Professional Document Mapping
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Stop using slow cloud converters. Our <strong>Professional DOCX Studio</strong> uses high-fidelity semantic mapping to turn Word documents into crisp, printable PDF files with zero data risk.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Layout className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Style Preservation</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses Mammoth.js engine to accurately map Word headings, lists, and tables into semantic structures.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Zap className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Latency</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">No waiting for server queues. Processing happens at native hardware speed on your device.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your sensitive resumes, reports, and contracts stay on your device. We never see your content.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Conversion FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the formatting change in PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We use a semantic mapping engine that preserves structure. While complex multi-column layouts might slightly shift, standard reports, resumes, and letters will look professional and consistent.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is there a file size limit?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No hard limit! Since the conversion happens in your browser RAM, you can process large documents as long as your device has enough memory. Most modern PCs and smartphones can handle 50+ page Word docs easily.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I convert old .doc files?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Currently, our engine is optimized for modern **.docx** files. Older .doc files may work if they use standard encoding, but for best results, we recommend saving them as .docx first.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
