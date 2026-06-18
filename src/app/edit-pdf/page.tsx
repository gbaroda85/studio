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
  alternates: { canonical: 'https://www.gr7imagepdf.com/edit-pdf' }
};

export default function EditPdfPage() {
  const deepSteps = [
    {
      title: "Workspace Import",
      description: "Upload any PDF. Our industrial engine renders all pages as high-resolution background buffers in your browser, enabling interactive overlays.",
      icon: "Monitor"
    },
    {
      title: "Content Eraser",
      description: "Use the 'Whiteout' tool to permanently hide sensitive info or logos. It works like a digital correction tape, perfect for sanitizing contracts.",
      icon: "Eraser"
    },
    {
      title: "Direct Overwrite",
      description: "Place new text boxes over whiteout areas. Type directly to fill forms or fix typos. Our engine handles absolute positioning with pixel accuracy.",
      icon: "Type"
    },
    {
      title: "Signature & Save",
      description: "Draw your signature or upload a PNG seal. Click 'Export PDF' to bundle everything into a fresh, sanitized document with zero quality loss.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full min-h-screen pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-2 px-4">
            <div className="w-full max-w-5xl text-center mb-8 space-y-2 no-print animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        PDF Editor Studio
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-xs md:text-sm">
                    Remove, Replace and Overwrite. The only truly private professional editor for your browser.
                </p>
            </div>
            
            <PdfEditor />
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="Professional PDF Editor" steps={deepSteps} />

            {/* AdSense Ready Deep Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Sparkles className="text-primary size-8" />
                        Next-Gen Content Removal
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard editors only let you add. Our <strong>Professional PDF Studio</strong> features a built-in "Masking Engine" that lets you erase existing text and replace it with your own, making it perfect for filling forms and fixing mistakes.
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
                                    <Layout className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">Content Eraser</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Use the Whiteout tool to hide unwanted text, dates, or logos. It works like a digital correction tape.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <FilePenLine className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Direct Typing</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Place text boxes anywhere and type directly on the canvas. Supports custom fonts and sizes for perfect matching.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% Private</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">All edits happen in your browser's local RAM. Your sensitive documents never travel to a server.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
