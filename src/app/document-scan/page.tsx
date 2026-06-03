
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, ScanLine, Smartphone, MonitorCheck, Zap, Sparkles } from 'lucide-react';
import DocumentScanner from '@/components/document-scanner';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Document Scan',
  description: 'Premium mobile scanner with AI filters. BW PRO, Magic Color, and high-fidelity text enhancement.',
};

export default function DocumentScanPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" className="mb-2" />

        <div className="w-full flex justify-center mb-6 px-4">
            <DocumentScanner />
        </div>

        <div className="w-full max-w-4xl space-y-12 px-4 pb-20">
            <HowToGuide title="Document Scanner" steps={[
                "Camera: Allow camera access and point at your document.",
                "Capture: Click the large button to snap a clear photo.",
                "Adjust: Drag the 4 precision dots to the corners of your document.",
                "Filters: Choose 'BW PRO' for sharp text or 'Magic' for vibrant colors.",
                "Export: Bundle multiple pages and download as a professional PDF."
            ]} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Sparkles className="text-primary size-8" />
                        Premium Extraction Engine
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Our <strong>Document Scanner</strong> uses neural-inspired division normalization to remove shadows, fix glare, and sharpen text lines exactly like top mobile apps.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Zap className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">BW PRO Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Intelligently sharpens text while preserving natural details of embedded photos and signatures.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <MonitorCheck className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Magic Color</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Brightens paper to studio white while keeping ink colors and stamps vibrant and authentic.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Offline</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Everything happens in your browser RAM. Your sensitive documents never leave your device.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
