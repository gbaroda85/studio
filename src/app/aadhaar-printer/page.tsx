import { Metadata } from 'next';
import { CreditCard, LayoutGrid, HelpCircle, ShieldCheck, Layout } from 'lucide-react';
import AadhaarPrinter from '@/components/aadhaar-printer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Universal ID Card Printer - Auto-Crop Aadhaar, PAN, DL & Voter ID Online',
  description: 'Easy print studio for Indian ID cards. Auto-crop A4 e-Aadhaar or upload separate front/back photos of PAN, DL, and Voter ID. 100% private and sized for printing.',
};

export default function AadhaarPrinterPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <CreditCard className="size-3" /> UNIVERSAL IDENTITY STUDIO
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    Smart ID <span className="text-gradient-hero">Printer</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Auto-crop Aadhaar or arrange PAN/DL sides for perfect 85.6mm x 54mm printing.
                </p>
            </div>
            
            <div className="w-full flex justify-center">
                <AadhaarPrinter />
            </div>
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="ID Card Printer" steps={[
                "Select Mode: Choose 'e-Aadhaar A4' or 'Separate Sides' (for PAN/DL/Voter).",
                "Upload: Select your PDF document or JPG/PNG photos.",
                "Adjust: Use the precision handles to align each side into the ID frame.",
                "Review: See your card arranged automatically at standard ISO dimensions.",
                "Print: Click 'Print Now' to get a perfect A4 sheet with standard ID sizes."
            ]} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <LayoutGrid className="text-primary size-8" />
                        Professional Document Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Whether it is your <strong>PAN Card, Driving Licence, or e-Aadhaar</strong>, our studio uses Canvas AI to lock your documents to exact government-standard dimensions (8.56cm x 5.4cm).
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <CreditCard className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Multi-ID Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Specially designed for Indian ID standards. Works perfectly for PAN, DL, Voter ID, and Health Cards.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Layout className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">300DPI Precision</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses high-density resampling to ensure small text and barcodes remain crystal clear after resizing.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Zero Server Logic</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All processing happens in your browser RAM. We never store or see your sensitive personal data.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Printing FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I print a PAN Card or DL?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Select the **"Individual Sides"** mode. Upload the front photo, click 'Adjust' to crop it, then repeat for the back photo. The tool will automatically pair them at the correct size for your wallet.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the printed card be the same size as my original?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. We use the **ISO/IEC 7810 ID-1** standard (85.60 × 53.98 mm). As long as you select "Actual Size" or "100%" in your printer settings, the output will fit perfectly in any standard wallet slot.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for my private ID details?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. **GR7 Smart Studio** is a client-side web utility. Your images are never uploaded. They are processed entirely within your device's temporary memory (RAM) and are wiped when you close the tab.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
