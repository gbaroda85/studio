
import { Metadata } from 'next';
import { QrCode, ShieldCheck, HelpCircle, Palette, Sparkles, Download, Zap, Smartphone, Globe, Share2 } from 'lucide-react';
import QrCodeGenerator from '@/components/qr-code-generator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional QR Code Generator - Custom Logos, Gradients & HD Export Online',
  description: 'Create high-quality custom QR codes for free. Supports URL, WiFi, vCard, WhatsApp, and more. Add logos, custom colors, and gradients. 100% private local processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/qr-code-generator' }
};

export default function QrCodeGeneratorPage() {
  const deepSteps = [
    {
      title: "Select Content Type",
      description: "Choose between URL, Text, WiFi, WhatsApp, or vCard. Our engine validates your input in real-time to ensure it follows international standards.",
      icon: "Type"
    },
    {
      title: "Visual Branding",
      description: "Customize dots, corners, and colors. Upload your brand logo and adjust its size. Use linear or radial gradients for a premium SaaS look.",
      icon: "Palette"
    },
    {
      title: "Engine Calibration",
      description: "Set the error correction level (L to H). Higher levels ensure scannability even if the code is partially damaged or covered by a logo.",
      icon: "Settings2"
    },
    {
      title: "HD Export",
      description: "Download as high-res PNG, SVG for vectors, or PDF for printing. Everything happens in your local RAM for 100% privacy.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> MARKETING STUDIO
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                    Smart QR <span className="text-gradient-hero">Generator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Generate industry-standard QR codes with custom logos, gradients, and shapes. 100% private and scannable.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <QrCodeGenerator />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="QR Code Generator" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Industrial Grade Scannable Patterns
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Our <strong>Professional QR Studio</strong> uses advanced vector mapping to ensure your generated codes are 100% scannable by all iOS, Android, and industrial scanners.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <QrCode className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Logo Embedding</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Embed your company logo directly into the QR code. Our high-level error correction keeps it 100% scannable.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Palette className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Gradient Styles</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Go beyond black and white. Use professional gradients and dot patterns to match your brand identity.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Privacy First</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All encoding logic runs locally on your CPU. Your URLs, passwords, and contact lists never leave your device.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">QR Code FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which error correction level should I choose?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            For standard URLs, **Level M (15%)** is usually enough. If you are adding a **Logo** in the middle, we recommend **Level H (30%)** to ensure the code remains scannable even with the logo covering parts of the pattern.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the QR code be sharp enough for billboards?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! For large-scale printing, download your QR code in **SVG format**. Being a vector format, it can be scaled to any size (like a massive billboard) without losing a single pixel of clarity.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I change the destination URL after printing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. This tool generates **Static QR Codes**. The data is encoded directly into the pattern. If you want to change the URL later, you would need a "Dynamic QR" service which usually requires a paid subscription. Our tool is 100% free and forever static.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
