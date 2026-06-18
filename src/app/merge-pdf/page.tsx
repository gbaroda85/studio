import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, SortAsc, ArrowUpDown, CheckCircle2, UploadCloud, Layers, Monitor, Download, Zap, X, ChevronDown } from 'lucide-react';
import PdfMerger from '@/components/pdf-merger';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Bulk PDF Merger - Combine Multiple PDFs into One Online Privately',
  description: 'Combine hundreds of PDF documents into a single secure file. Features bulk upload, A-Z sorting, and re-ordering controls. 100% private local processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/merge-pdf' }
};

export default function MergePdfPage() {
  const deepSteps = [
    {
      title: "Batch Import",
      description: "Upload multiple PDF documents. Our engine initializes a safe buffer stack in your device RAM, mapping the pages without any server communication.",
      icon: "UploadCloud"
    },
    {
      title: "Stack Sequence",
      description: "Drag and drop files to change order, or use the 'Sort A-Z' tool. Precise ordering is critical for legal and academic bundles.",
      icon: "Layers"
    },
    {
      title: "Visual Audit",
      description: "Click 'Merge Pdfs'. Once combined, our built-in viewer renders the first 10 pages instantly so you can audit the sequence before saving.",
      icon: "Monitor"
    },
    {
      title: "WASM Export",
      description: "The engine bundles the final document using WebAssembly logic. Save your combined PDF. Zero quality loss and 100% data privacy.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20 text-left">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                {/* PREMIUM CAPSULE HEADER */}
                <div className="inline-flex items-center p-1 md:p-1.5 pr-4 md:pr-6 rounded-full bg-[#e0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-500/20 shadow-sm mb-4 mx-auto group transition-all hover:scale-105">
                    <div className="size-7 md:size-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-lg shrink-0">
                        <X className="size-4 md:size-5 stroke-[4]" />
                    </div>
                    <span className="ml-3 font-black text-[10px] md:text-xs tracking-widest text-slate-800 dark:text-emerald-400 uppercase">
                        PDF MERGER
                    </span>
                    <div className="w-px h-4 bg-slate-300/60 dark:bg-emerald-500/20 mx-4" />
                    <ChevronDown className="size-4 text-slate-800 dark:text-emerald-400 opacity-50" />
                </div>

                {/* 3D TITLE BAR */}
                <div className="w-full max-w-4xl mx-auto p-1 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-200 dark:bg-slate-800 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,1)] mb-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] md:rounded-[3.3rem] py-4 md:py-6 px-10 flex items-center justify-center border border-white/40 dark:border-white/5 shadow-inner transition-all hover:scale-[1.01]">
                        <h1 className="text-2xl md:text-4xl lg:text-5xl tracking-tighter leading-none flex flex-col items-center">
                            <span className="font-['Dancing_Script'] text-primary normal-case text-2xl md:text-4xl lg:text-5xl block mb-[-10px]">Bulk PDF</span>
                            <span className="font-jakarta font-black uppercase text-gradient-hero">Merger Studio</span>
                        </h1>
                    </div>
                </div>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Combine hundreds of PDF documents into a single secure file instantly.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PdfMerger />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Bulk PDF Merger" steps={deepSteps} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <CheckCircle2 className="text-primary size-8" />
                        Professional Document Bundling
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Managing multiple PDFs for a single application is a hassle. Our <strong>Pro PDF Merger</strong> allows you to bundle dozens of documents with professional-grade control.
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
                                    <SortAsc className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">BULK SORTING</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Auto-sort your files alphabetically or by numerical order with a single click. No more manual dragging.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <ArrowUpDown className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">ORDER CONTROL</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Full control over the sequence. Move any file to the top or bottom of the list instantly for perfect organization.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">SECURITY FIRST</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Combining files happens entirely in browser RAM. Your private documents never touch our server.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
