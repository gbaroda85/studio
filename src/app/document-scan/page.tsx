import { Metadata } from 'next';
import { Sparkles, Zap, ShieldCheck, MonitorCheck, ScanLine, HelpCircle, Smartphone, FileStack, Download, X, ChevronDown } from 'lucide-react';
import { DocumentScannerClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional Document Scanner - AI Filters & HD PDF Export Online',
  description: 'Premium mobile scanner with AI filters. BW PRO, Magic Color, and high-fidelity text enhancement. 100% private local processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/document-scan' }
};

export default function DocumentScanPage() {
  const deepSteps = [
    {
      title: "Sensor Calibration",
      description: "Grant camera access. Our scanner initializes your device sensor to capture 1080p raw frames with environment-mode optimization for documents.",
      icon: "Smartphone"
    },
    {
      title: "Corner Mapping",
      description: "Snap the photo and use the 8-dot handles to map the paper corners. Our engine calculates the homography matrix to flatten tilted photos instantly.",
      icon: "Scan"
    },
    {
      title: "Industrial Filtering",
      description: "Select 'BW PRO' for crisp text or 'Magic' for vibrant signatures. Adjust brightness and contrast manually using the Studio Fine-Tune panel.",
      icon: "FileStack"
    },
    {
      title: "Bundle & Save",
      description: "Scan multiple pages and bundle them into a single PDF. Everything is processed in local RAM using high-DPI rendering for industrial quality.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center min-h-screen w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Document Scanner
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Capture, auto-crop, and enhance documents with industrial-grade AI filters. 100% private.
                </p>
            </div>
            
            {/* The Main Tool Component - LOADED VIA CLIENT WRAPPER */}
            <div className="w-full max-w-6xl flex justify-center">
                <DocumentScannerClient />
            </div>
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-24 no-print mx-auto">
            <HowToGuide title="Document Scanner" steps={deepSteps} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <ScanLine className="text-primary size-8" />
                        Professional Extraction Engine
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Our <strong>Document Scanner</strong> uses neural-inspired normalization to remove shadows, fix glare, and sharpen text lines exactly like top-tier mobile apps.
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
                                    <Zap className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">BW PRO MODE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Intelligently sharpens text while preserving natural details of embedded photos and signatures for official forms.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <MonitorCheck className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">MAGIC COLOR</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Brightens paper to studio white while keeping ink colors and stamps vibrant and authentic for legal paperwork.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% OFFLINE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Everything happens in your browser RAM. Your sensitive documents, bank statements, and ID cards never leave your device.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
