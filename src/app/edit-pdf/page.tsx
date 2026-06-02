import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, FilePenLine, Layout, Sparkles, Zap, MousePointer2 } from 'lucide-react';
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
  title: 'Professional PDF Editor - Add Text, Images & Organize Pages Online Privately',
  description: 'Full-featured PDF editor. Add custom text, signatures, logos, or reorganze pages locally in your browser. 100% private and secure document studio.',
};

export default function EditPdfPage() {
  const steps = [
    "Upload: Select a PDF document from your device.",
    "Select Page: Use the left sidebar to focus on a specific page.",
    "Add Content: Use the 'Text' or 'Image' buttons to add overlays.",
    "Position: Use sliders in the studio panel to set exact coordinates and sizes.",
    "Manage Pages: Rotate or delete unwanted pages using the grid controls.",
    "Save: Click 'Save Edits' to export your new document with all modifications."
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <FilePenLine className="size-3" /> PROFESSIONAL DOCUMENT STUDIO
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    Smart <span className="text-gradient-hero">PDF Editor</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    The only truly private PDF editor. Add text and signatures without any server uploads.
                </p>
            </div>
            
            <PdfEditor />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="PDF Editor Studio" steps={steps} />

            {/* AdSense Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Sparkles className="text-primary size-8" />
                        Next-Gen Browser Editing
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard editors require subscriptions or cloud access. Our <strong>Professional PDF Editor</strong> leverages high-performance WASM technology to manipulate PDF structures directly on your device CPU.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Layout className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Page Control</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Rotate skewed pages or delete unwanted content from bulk documents with a single click.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <MousePointer2 className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Visual Overlays</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Add names, dates, or signatures anywhere on the document with precision coordinates.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All rendering happens in your browser RAM. Your sensitive docs never leave your device.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Editing FAQs</h2>
                    <p className="text-muted-foreground font-medium italic">Everything you need to know about local PDF editing.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I edit existing text in the PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. This tool is designed for **Overlay Editing**. You can add new text on top of existing content (or "mask" old text by adding a white background) but you cannot delete the characters built into the original vector layer.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I add my signature?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Click on the **'Image'** tool in the editor header. Select a transparent PNG of your signature. You can then use the sliders to place it exactly on the signature line.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for legal documents?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This is the **most secure method** available because there is no server involved. Your document never travels over the internet.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
