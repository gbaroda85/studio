import { Metadata } from 'next';
import { Scissors, ShieldCheck, HelpCircle, LayoutGrid, MousePointer2 } from 'lucide-react';
import PdfSplitter from '@/components/pdf-splitter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Visual PDF Splitter - Extract & Split PDF Pages Online Privately',
  description: 'Visually select and extract specific pages from any PDF file. Features grid-preview selection and instant local processing. 100% private and secure.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/split-pdf' }
};

export default function SplitPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Split PDF Studio
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base uppercase tracking-widest opacity-60">
                    Extract specific pages or combine multiple documents. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PdfSplitter />
            </div>
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 mx-auto pb-20">
            <HowToGuide title="Visual PDF Splitter" steps={[
                "Upload: Select a multi-page PDF from your device.",
                "Visual Grid: Every page will be rendered as a preview in the grid.",
                "Select: Click on the pages you want to keep or type ranges like '1-5'.",
                "Extract: Hit the extract button to create a new PDF instantly."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Scissors className="text-primary size-8" />
                        Precision Document Extraction
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard splitters make you guess page numbers. Our <strong>Visual Splitter</strong> lets you see exactly what you are extracting, making it perfect for legal docs, study materials, and complex bank statements.
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
                                    <LayoutGrid className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">Grid Preview</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Stop guessing! See page thumbnails to ensure you only extract the exact information you need.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <MousePointer2 className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Click Selection</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Toggle pages with a simple click. Our logic automatically builds the range string for you.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">Secure Sandbox</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Extraction happens 100% in your browser memory. Your sensitive pages are never uploaded.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
