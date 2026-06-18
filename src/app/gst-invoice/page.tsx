import { Metadata } from 'next';
import GstInvoiceGenerator from '@/components/gst-invoice-generator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Receipt, ShieldCheck, HelpCircle, FileDigit, Smartphone, Zap, Sparkles, X, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GST Invoice Generator - Create Professional Invoices Online Free (A4 PDF)',
  description: 'Generate GST compliant tax invoices instantly. Supports HSN/SAC codes, CGST, SGST, IGST calculations. 100% private local processing for small businesses.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/gst-invoice' }
};

export default function GstInvoicePage() {
  const deepSteps = [
    {
      title: "Business Setup",
      description: "Enter your company name, GSTIN, and registered address. This data stays 100% in your local RAM for privacy.",
      icon: "Building2"
    },
    {
      title: "Recipient Details",
      description: "Add customer name and their GST details. Select between 'Intra-state' (CGST+SGST) or 'Inter-state' (IGST) tax logic.",
      icon: "User2"
    },
    {
      title: "Line Item Entry",
      description: "List products or services with HSN codes, quantity, and rates. The engine automatically calculates the tax breakdown per item.",
      icon: "ListFilter"
    },
    {
      title: "HD Studio Export",
      description: "Click 'Generate Invoice'. Our engine renders a high-fidelity A4 document at 300DPI, ready for professional printing and sharing.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 no-print max-w-[1600px] mx-auto">
            {/* Compact Hero Section */}
            <div className="w-full max-w-5xl text-center mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                {/* PREMIUM CAPSULE HEADER */}
                <div className="inline-flex items-center p-1 md:p-1.5 pr-4 md:pr-6 rounded-full bg-[#e0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-500/20 shadow-sm mb-4 mx-auto group transition-all hover:scale-105">
                    <div className="size-7 md:size-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-lg shrink-0">
                        <X className="size-4 md:size-5 stroke-[4]" />
                    </div>
                    <span className="ml-3 font-black text-[10px] md:text-xs tracking-widest text-slate-800 dark:text-emerald-400 uppercase">
                        BILLING STUDIO
                    </span>
                    <div className="w-px h-4 bg-slate-300/60 dark:bg-emerald-500/20 mx-4" />
                    <ChevronDown className="size-4 text-slate-800 dark:text-emerald-400 opacity-50" />
                </div>

                {/* 3D TITLE BAR */}
                <div className="w-full max-w-4xl mx-auto p-1 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-200 dark:bg-slate-800 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,1)] mb-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] md:rounded-[3.3rem] py-4 md:py-6 px-10 flex items-center justify-center border border-white/40 dark:border-white/5 shadow-inner transition-all hover:scale-[1.01]">
                        <h1 className="text-xl md:text-3xl lg:text-5xl font-jakarta font-black tracking-tighter uppercase leading-none">
                            GST Invoice <span className="text-gradient-hero">Generator</span>
                        </h1>
                    </div>
                </div>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Create professional GST-compliant invoices instantly. Fast, accurate, and 100% private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <GstInvoiceGenerator />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="GST Invoice Generator" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Billing for Small Business
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Stop using slow accounting software. Our <strong>Professional Invoice Studio</strong> is designed for speed. Generate a high-fidelity GST invoice in under 60 seconds with 100% data security.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Receipt className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">GST Compliant</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Follows Indian GST standards with HSN/SAC tracking and automatic tax splitting (CGST, SGST, IGST).</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <FileDigit className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">300DPI Precision</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses industrial canvas rendering to ensure every line and text character is razor-sharp for professional printing.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Server Leak</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All billing data stays in your browser memory. We never store or see your client names, rates, or turnover details.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Billing FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which GST rate should I choose?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            GST rates depend on the type of product or service. Standard rates are **5%, 12%, 18%, and 28%**. For IT services and many electronic goods, 18% is the most common rate. Consult your CA for specific item mappings.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">When do I use IGST instead of CGST/SGST?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Use **IGST** (Integrated GST) when you are selling to a customer in a different state. Use **CGST + SGST** when the customer and your business are in the same state. Our tool handles the math for both automatically.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Are my invoices stored on the cloud?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. **GR7 Tools** is a client-side utility. Every invoice you generate is processed entirely within your device's temporary memory (RAM). Once you close the tab, all data is wiped for your security.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
