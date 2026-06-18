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
import { RotateCw, ShieldCheck, HelpCircle, LayoutGrid, MonitorCheck, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rotate PDF Online - Permanently Rotate Individual or All Pages Privately',
  description: 'Easily rotate your PDF documents. Rotate individual pages or the entire file by 90, 180, or 270 degrees. 100% private local browser-based tool.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/rotate-pdf' }
};

export default function RotatePdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Rotate PDF Studio
                    </span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground font-semibold max-xl mx-auto uppercase tracking-widest opacity-60">
                    Fix sideways scans and upside-down documents instantly.
                </p>
            </div>
            <div className="w-full flex justify-center">
                <PdfRotator />
            </div>
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="PDF Rotator Studio" steps={[
                "Upload: Select the PDF document you want to rotate.",
                "Visual Grid: See all pages as thumbnails in the studio workspace.",
                "Rotate Individual: Hover over any page to rotate it by 90 degrees.",
                "Bulk Rotate: Use the 'Rotate All' buttons in the sidebar for the entire doc.",
                "Save: Click 'Save PDF' to generate and download your corrected document."
            ]} />

            {/* Infographic Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Page Orientation
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Scanned documents are often sideways or upside down. Our <strong>Professional PDF Rotator</strong> allows you to fix page orientation with pixel-perfect accuracy using local RAM processing.
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
                                    <RotateCw className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">Full Control</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Rotate by 90, 180, or 270 degrees. Fix landscape or portrait orientation instantly.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <LayoutGrid className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Visual Previews</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Stop guessing. See exactly how each page looks before you save the final document.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% Private</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Your documents never leave your device. All rotation math happens 100% locally in your browser.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
