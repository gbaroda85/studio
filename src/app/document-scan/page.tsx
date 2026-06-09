import { Metadata } from 'next';
import { Sparkles, Zap, ShieldCheck, MonitorCheck, ScanLine, HelpCircle } from 'lucide-react';
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
    <main className="flex-1 flex flex-col items-center min-h-screen w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            {/* Standard Hero Section */}
            <div className="w-full max-w-5xl text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-3" /> PREMIUM SCANNING STUDIO
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    Smart <span className="text-gradient-hero">Scanner</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-sm md:text-base">
                    Capture, auto-crop, and enhance documents with industrial-grade AI filters. 100% private.
                </p>
            </div>
            
            {/* The Main Tool Component - LOADED VIA CLIENT WRAPPER */}
            <div className="w-full max-w-6xl flex justify-center">
                <DocumentScannerClient />
            </div>
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-24 no-print">
            <HowToGuide title="Document Scanner" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <ScanLine className="text-primary size-8" />
                        Professional Extraction Engine
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Our <strong>Document Scanner</strong> uses neural-inspired normalization to remove shadows, fix glare, and sharpen text lines exactly like top-tier mobile apps.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Zap className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">BW PRO Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">Intelligently sharpens text while preserving natural details of embedded photos and signatures for official forms.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <MonitorCheck className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Magic Color</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">Brightens paper to studio white while keeping ink colors and stamps vibrant and authentic for legal paperwork.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Offline</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">Everything happens in your browser RAM. Your sensitive documents, bank statements, and ID cards never leave your device.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
