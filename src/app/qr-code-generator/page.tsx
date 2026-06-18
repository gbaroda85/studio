import { Metadata } from 'next';
import { QrCode, ShieldCheck, HelpCircle, Palette, Sparkles, Download, Zap, Smartphone, Globe, Share2, X, ChevronDown, Monitor } from 'lucide-react';
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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        QR Code Generator
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Generate industry-standard QR codes with custom logos, gradients, and shapes. 100% private and scannable.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <QrCodeGenerator />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="QR Code Generator" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional QR Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Our <strong>Professional Studio</strong> uses advanced vector mapping to ensure your generated codes are 100% scannable by all iOS, Android, and industrial scanners.
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
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">BRAND READY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Embed logos and use professional gradients to match your brand identity perfectly without losing scannability.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Monitor className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">SMART ENGINE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">High-level error correction ensures your codes remain readable even if partially damaged or covered by a logo.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% PRIVATE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">All encoding logic runs locally on your CPU. Your URLs, passwords, and contact lists never leave your device.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">QR Code FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which error correction level should I choose?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            For standard URLs, **Level M (15%)** is usually enough. If you are adding a **Logo** in the middle, we recommend **Level H (30%)** to ensure the code remains scannable even with the logo covering parts of the pattern.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the QR code be sharp enough for billboards?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Yes! For large-scale printing, download your QR code in **SVG format**. Being a vector format, it can be scaled to any size (like a massive billboard) without losing a single pixel of clarity.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I change the destination URL after printing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            No. This tool generates **Static QR Codes**. The data is encoded directly into the pattern. If you want to change the URL later, you would need a "Dynamic QR" service which usually requires a paid subscription. Our tool is 100% free and forever static.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
