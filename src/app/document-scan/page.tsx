
import { Metadata } from 'next';
import { Sparkles, Zap, ShieldCheck, MonitorCheck, ScanLine, HelpCircle } from 'lucide-react';
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
  title: 'Professional Document Scanner - AI Filters & HD PDF Export Online',
  description: 'Premium mobile scanner with AI filters. BW PRO, Magic Color, and high-fidelity text enhancement. 100% private local processing.',
};

export default function DocumentScanPage() {
  return (
    <main className="flex-1 flex flex-col items-center min-h-screen w-full">
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
            
            {/* The Main Tool Component */}
            <div className="w-full max-w-[1700px] flex justify-center">
                <DocumentScanner />
            </div>
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-24 no-print">
            <HowToGuide title="Document Scanner" steps={[
                "Camera: Allow camera access and point at your document.",
                "Capture: Click the large button to snap a clear photo.",
                "Adjust: Drag the 4 precision dots to the corners of your document.",
                "Filters: Choose 'BW PRO' for sharp text or 'Magic' for vibrant colors.",
                "Export: Bundle multiple pages and download as a professional PDF."
            ]} />

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

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Scanning FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it better than a phone camera photo?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. A photo is just an image. Our scanner **corrects perspective** (straightens tilted photos) and applies **industrial filters** that normalize lighting and sharpen text, making it look like a high-end flatbed scan.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How many pages can I scan into one PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            You can scan and bundle as many pages as your device's memory allows. Most modern smartphones and PCs can easily handle **30-50 pages** in a single professional PDF bundle.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use this for bank statements or Aadhaar?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This is the **most secure method** because we use client-side technology. Your sensitive documents are never uploaded to any cloud server, keeping your private data 100% on your device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
