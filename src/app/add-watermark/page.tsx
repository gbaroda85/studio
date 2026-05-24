
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, PenTool, Type, Eye } from 'lucide-react';
import PdfWatermarker from '@/components/pdf-watermarker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Add Watermark to PDF Online - Protect Your Documents with Custom Text Watermarks',
  description: 'Add custom text watermarks to your PDF files. Control opacity, rotation, and position instantly. Secure local browser-based processing.',
};

export default function AddWatermarkPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfWatermarker />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="PDF Watermark Studio" steps={[
                "Upload: Select the PDF document you want to protect.",
                "Text: Enter your watermark text (e.g., 'DRAFT', 'CONFIDENTIAL').",
                "Settings: Adjust opacity to make it subtle and set the position.",
                "Rotation: Use diagonal presets or manual rotation for maximum protection.",
                "Apply: Generate and download your watermarked PDF instantly."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <PenTool className="text-primary size-8" />
                        Protect Your Intellectual Property
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Prevent unauthorized copying and sharing. Our <strong>PDF Watermark Tool</strong> embeds professional text overlays across all pages, ensuring your ownership is visible on every copy.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Type className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Custom Text</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Full control over the watermark message. Add your name, company, or copyright notice.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Eye className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Opacity Control</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Make watermarks translucent so they don't block the main content while remaining visible.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Watermarking happens in your browser RAM. Your sensitive docs are never seen by anyone else.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Watermarking FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can the watermark be removed easily?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Our tool **hard-embeds** the text into the PDF structure. While advanced tools might be able to edit it, for 99% of users, the watermark is a permanent part of the document.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it apply to every page automatically?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Our tool automatically detects all pages in your PDF and applies the exact same watermark settings across the entire document.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why use a diagonal watermark?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Diagonal watermarks are the most secure because they cross through multiple lines of text, making it nearly impossible to crop out the watermark without destroying the content.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
