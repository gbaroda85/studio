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
  alternates: { canonical: 'https://www.gr7imagepdf.com/add-watermark' }
};

export default function AddWatermarkPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PdfWatermarker />
        </div>

        <div className="w-full max-w-7xl space-y-16 px-4 mx-auto pb-20">
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
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <PenTool className="text-primary size-8" />
                        Protect Your Intellectual Property
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Prevent unauthorized copying and sharing. Our <strong>PDF Watermark Tool</strong> embeds professional text overlays across all pages, ensuring your ownership is visible on every copy.
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
                                    <Type className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">Custom Text</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Full control over the watermark message. Add your name, company, or copyright notice.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Eye className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Opacity Control</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Make watermarks translucent so they don't block the main content while remaining visible.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% Private</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Watermarking happens in your browser RAM. Your sensitive docs are never seen by anyone else.</p>
                            </div>
                        </div>
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
