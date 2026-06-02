import { Metadata } from 'next';
import { FilePenLine, ShieldCheck, HelpCircle, Sparkles, Zap, Layout } from 'lucide-react';
import PdfEditor from '@/components/pdf-editor';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional PDF Editor - Edit Text, Remove Content & Overwrite Online',
  description: 'The most powerful private PDF editor. Directly type new text, remove existing content with whiteout, and insert images locally in your browser memory.',
};

export default function EditPdfPage() {
  const steps = [
    "Upload: Select a PDF document from your device workspace.",
    "Remove Text: Use the 'Whiteout' tool to hide existing text or logos.",
    "Add Text: Use the 'Add Text' tool to type new information over any area.",
    "Direct Interaction: Double-click text boxes to edit content directly on canvas.",
    "Sign & Brand: Insert PNG signatures or logos with custom opacity.",
    "Export: Save your modified document as a high-fidelity vector PDF."
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full min-h-screen">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-2 px-4">
            <div className="w-full max-w-5xl text-center mb-8 space-y-2 no-print animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <FilePenLine className="size-3" /> INDUSTRIAL DOCUMENT STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Smart <span className="text-gradient-hero">PDF Editor</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Remove, Replace and Overwrite. The only truly private professional editor for your browser.
                </p>
            </div>
            
            <PdfEditor />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="Professional PDF Editor" steps={steps} />

            {/* AdSense Ready Deep Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Sparkles className="text-primary size-8" />
                        Next-Gen Content Removal
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard editors only let you add. Our <strong>Professional PDF Studio</strong> features a built-in "Masking Engine" that lets you erase existing text and replace it with your own, making it perfect for filling forms and fixing mistakes.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Layout className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Content Eraser</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Use the Whiteout tool to hide unwanted text, dates, or logos. It works like a digital correction tape.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <FilePenLine className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Direct Typing</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Place text boxes anywhere and type directly on the canvas. Supports custom fonts and sizes for perfect matching.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All edits happen in your browser's local RAM. Your sensitive documents never travel to a server.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Editing FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I remove text from a PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Click the **"Whiteout"** button in the toolbar. A white block will appear on your page. Drag it over the text you want to hide and resize it using the sidebar controls to cover the area perfectly.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I change existing text directly?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Since PDFs are static files, you first use the **Whiteout tool** to hide the old text, then use the **Add Text tool** to type the new content exactly over it. This gives the effect of a direct edit.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for signing contracts?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This is the most secure method because your contract is never uploaded to any cloud. The signature and text overlays are embedded locally on your device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
