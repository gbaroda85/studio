
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
import { CreditCard, LayoutGrid, HelpCircle, ShieldCheck, Layout, Scan, Maximize, Printer, Sparkles } from 'lucide-react';

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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=file" label="Back to File Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            {/* Reduced Font Sizes and Shifted Down */}
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> IDENTITY STUDIO
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

        <div className="w-full max-w-[1600px] mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="ID Card Printer" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Document Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Whether it is your <strong>PAN Card, Driving Licence, or e-Aadhaar</strong>, our studio uses smart canvas technology to lock your documents to exact government-standard dimensions (8.56cm x 5.4cm).
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                    <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-2 shadow-xl space-y-6 hover:border-primary/50 transition-all">
                        <CreditCard className="text-primary size-12" />
                        <h3 className="font-black uppercase text-base tracking-widest text-slate-800 dark:text-white">Multi-ID Ready</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Specially designed for Indian ID standards. Works perfectly for PAN, DL, Voter ID, and Health Cards.</p>
                    </div>
                    <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-2 shadow-xl space-y-6 hover:border-blue-500/50 transition-all">
                        <Layout className="text-blue-500 size-12" />
                        <h3 className="font-black uppercase text-base tracking-widest text-slate-800 dark:text-white">300DPI Precision</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Uses high-density resampling to ensure small text and barcodes remain crystal clear after resizing.</p>
                    </div>
                    <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-2 shadow-xl space-y-6 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-12" />
                        <h3 className="font-black uppercase text-base tracking-widest text-slate-800 dark:text-white">Zero Server Logic</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">All processing happens in your browser RAM. We never store or see your sensitive personal data.</p>
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
