import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Layers, Trash2, RotateCw, Move, CheckCircle2, LayoutGrid, Scan, Maximize, Printer } from 'lucide-react';
import PdfOrganizer from '@/components/pdf-organizer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional PDF Organizer - Delete, Reorder & Insert Blank Pages Online',
  description: 'The ultimate visual PDF manager. Delete pages, drag to reorder, rotate, and insert blank pages locally in your browser. 100% private and secure.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/organize-pdf' }
};

export default function OrganizePdfPage() {
  const deepSteps = [
    {
      title: "Import Document",
      description: "Upload your PDF. Our engine renders every page as a high-resolution buffer in your local RAM for visual management.",
      icon: "UploadCloud"
    },
    {
      title: "Visual Structuring",
      description: "Drag and drop pages to change their order. Use the 'Delete' icon on any page to permanently remove it from the document.",
      icon: "Layers"
    },
    {
      title: "Interactive Controls",
      description: "Rotate individual pages or insert fresh blank A4 pages exactly where you need them using the card-level action buttons.",
      icon: "Plus"
    },
    {
      title: "Final Bundle",
      description: "Click 'Save Changes' to re-serialize the PDF. All work happens 100% offline on your device for total privacy.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-24 md:pt-36">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        {/* Main Tool Container with massive breathing room to avoid overlap */}
        <div className="w-full flex flex-col items-center mb-24 md:mb-32 px-4 relative z-10">
            <div className="w-full flex justify-center">
                <PdfOrganizer />
            </div>
        </div>

        {/* Guide Section with explicit spacing to avoid overlap */}
        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20 mt-16 md:mt-24 border-t pt-16 relative z-0">
            <HowToGuide title="PDF Organizer Pro" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Full Control Over Your Document
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Standard PDF viewers don't let you change the structure. Our <strong>Professional Organizer</strong> gives you the tools of a high-end desktop app directly in your browser.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Trash2 className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Delete Pages</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Remove blank pages, unwanted cover sheets, or sensitive information with a single click.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Move className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Visual Reorder</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Easily change the sequence of pages by dragging them into the perfect position.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">No files are uploaded. Every modification happens in your local RAM for total data security.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Organization FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is deleting a page permanent?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The page is removed from the **new file** we generate. Your original file on your computer remains untouched. You only download the organized version.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I organize encrypted PDFs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. For security reasons, you must first remove the password using our **"Unlock PDF"** tool. Once the file is open, you can upload it here for organization.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the quality drop after reordering?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely not. We use **Vector-based re-serialization**. This means we only change the "index" of the pages without re-compressing the internal data. Your text and images stay crystal clear.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
