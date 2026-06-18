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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Organize PDF Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Delete, reorder and rotate pages visually. The ultimate private manager.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PdfOrganizer />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="PDF Organizer Pro" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Full Control Over Your Document
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard PDF viewers don't let you change the structure. Our <strong>Professional Organizer</strong> gives you the tools of a high-end desktop app directly in your browser.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-rose-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-rose-400 to-red-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shadow-inner">
                                    <Trash2 className="text-rose-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-rose-600">DELETE PAGES</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Remove blank pages, unwanted cover sheets, or sensitive information with a single click.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Move className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">VISUAL REORDER</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Easily change the sequence of pages by dragging them into the perfect position.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-teal-400 to-emerald-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-teal-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-teal-600">100% PRIVATE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">No files are uploaded. Every modification happens in your local RAM for total data security.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Organization FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is deleting a page permanent?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            The page is removed from the **new file** we generate. Your original file on your computer remains untouched. You only download the organized version.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Can I organize encrypted PDFs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            No. For security reasons, you must first remove the password using our **"Unlock PDF"** tool. Once the file is open, you can upload it here for organization.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will the quality drop after reordering?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely not. We use **Vector-based re-serialization**. This means we only change the "index" of the pages without re-compressing the internal data. Your text and images stay crystal clear.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
