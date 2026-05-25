import { Metadata } from 'next';
import { Printer, ShieldCheck, HelpCircle, Layout, Scissors, Smartphone } from 'lucide-react';
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
  title: 'Aadhaar Card Easy Printer - Auto-Crop & Arrange e-Aadhaar for Print Online',
  description: 'Instantly crop the ID portion from your e-Aadhaar A4 image. Automatically arranges Front and Back sides at standard 85.6mm x 54mm size for easy printing.',
};

export default function AadhaarPrinterPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <AadhaarPrinter />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Aadhaar Card Printer" steps={[
                "Upload: Select the JPG or PNG image of your e-Aadhaar A4 document.",
                "Auto-Crop: Our tool will automatically extract the bottom ID portion.",
                "Review: See the Front and Back sides separated and resized automatically.",
                "Print: Click 'Print Now' to get a perfect A4 sheet with standard ID sizes.",
                "Cut & Fold: Use the printed guide to cut your card and fold it for use."
            ]} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Layout className="text-primary size-8" />
                        Professional Aadhaar Formatting
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard e-Aadhaar downloads are A4 size, which is hard to carry. Our <strong>Smart Aadhaar Studio</strong> uses Canvas AI to isolate the card portion and scale it to exact government-standard ID dimensions.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Scissors className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Auto Split</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Automatically detects and splits the ID strip into separate Front and Back images for better paper economy.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Layout className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">85.6mm Standard</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Forces exact ISO/IEC 7810 ID-1 card dimensions (8.56cm x 5.4cm) during the printing process.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your personal ID data is processed entirely in your browser memory. We never store or see your Aadhaar details.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Printer FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why use this instead of normal printing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Normal printing of e-Aadhaar leaves you with a huge A4 sheet. This tool crops exactly the portion meant for your wallet, resizes it correctly, and places both sides on one page to save ink and paper.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to upload my Aadhaar image?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. This tool uses <strong>Client-Side Processing</strong>. The "Upload" doesn't send the file to any server; it just loads it into your browser's local RAM. Your privacy is 100% guaranteed.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the best way to take a photo of the A4 Aadhaar?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            For best results, use our <strong>"Scan to PDF"</strong> or <strong>"Smart Crop"</strong> tool to get a flat, top-down image of your A4 Aadhaar first, then upload that clean image here.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
