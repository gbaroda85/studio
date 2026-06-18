import { Metadata } from 'next';
import AadhaarPrinter from '@/components/aadhaar-printer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CreditCard, LayoutGrid, HelpCircle, ShieldCheck, Layout, Scan, Maximize, Printer, Sparkles, X, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart ID Card Printer - Auto-Crop Aadhaar, PAN, DL & Voter ID Online',
  description: 'Easy print studio for Indian ID cards. Auto-crop A4 e-Aadhaar or upload separate front/back photos of PAN, DL, and Voter ID. 100% private and sized for printing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/aadhaar-printer' }
};

export default function AadhaarPrinterPage() {
  const deepSteps = [
    {
      title: "Workflow Mode",
      description: "Select between 'A4 e-Aadhaar' for official PDF strips or 'Individual Sides' for separate PAN/DL/Voter photos taken at angles.",
      icon: "LayoutGrid"
    },
    {
      title: "Studio Refinement",
      description: "Use the 8-dot industrial scanner to straighten tilted photos. Our engine uses perspective matrices to flatten angled documents instantly.",
      icon: "Scan"
    },
    {
      title: "ISO Sizing",
      description: "The tool automatically scales both sides to the standard ISO/IEC 7810 ID-1 size (85.6mm x 54mm) for a perfect wallet fit.",
      icon: "Maximize"
    },
    {
      title: "Print Render",
      description: "Generate a high-fidelity A4 sheet preview. Click 'Print Now' to output a 300DPI document ready for physical printing.",
      icon: "Printer"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=file" label="Back to File Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* PREMIUM CAPSULE HEADER */}
                <div className="inline-flex items-center p-1 md:p-1.5 pr-4 md:pr-6 rounded-full bg-[#e0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-500/20 shadow-sm mb-4 mx-auto group transition-all hover:scale-105">
                    <div className="size-7 md:size-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-lg shrink-0">
                        <X className="size-4 md:size-5 stroke-[4]" />
                    </div>
                    <span className="ml-3 font-black text-[10px] md:text-xs tracking-widest text-slate-800 dark:text-emerald-400 uppercase">
                        AADHAAR PRINTER
                    </span>
                    <div className="w-px h-4 bg-slate-300/60 dark:bg-emerald-500/20 mx-4" />
                    <ChevronDown className="size-4 text-slate-800 dark:text-emerald-400 opacity-50" />
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">
                    Smart ID <span className="text-gradient-hero">Printer</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Auto-crop Aadhaar, PAN, DL and Voter ID for perfect wallet-sized printing. 100% private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <AadhaarPrinter />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="ID Card Printer" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Document Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Whether it is your <strong>PAN Card, Driving Licence, or e-Aadhaar</strong>, our studio uses smart canvas technology to lock your documents to exact dimensions.
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
                                    <CreditCard className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">MULTI-ID READY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Specially designed for Indian ID standards. Works perfectly for PAN, DL, Voter ID, and Health Cards.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Layout className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">300DPI PRECISION</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Uses high-density resampling to ensure small text and barcodes remain crystal clear after resizing.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO SERVER LOGIC</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">All processing happens in your browser RAM. We never store or see your sensitive personal data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Printing FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">How do I print a PAN Card or DL?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Select the **"Individual Sides"** mode. Upload the front photo, click 'Adjust' to crop it, then repeat for the back photo. The tool will automatically pair them at the correct size for your wallet.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will the printed card be the same size as my original?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Yes. We use the **ISO/IEC 7810 ID-1** standard (85.60 × 53.98 mm). As long as you select "Actual Size" or "100%" in your printer settings, the output will fit perfectly in any standard wallet slot.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe for my private ID details?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. **GR7 Smart Studio** is a client-side web utility. Your images are never uploaded. They are processed entirely within your device's temporary memory (RAM) and are wiped when you close the tab.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
