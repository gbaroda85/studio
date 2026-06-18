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
import { Receipt, ShieldCheck, HelpCircle, FileDigit, Smartphone, Zap, Sparkles, X, ChevronDown, Layout } from 'lucide-react';

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
            <div className="w-full max-w-5xl text-center mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        GST Invoice Generator
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-sm">
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
            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Billing Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Ditch slow accounting software. Our <strong>Professional Invoice Engine</strong> is designed for speed and local data security.
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
                                    <Receipt className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">GST COMPLIANT</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Follows Indian GST standards with HSN/SAC tracking and automatic tax splitting (CGST, SGST, IGST).</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <FileDigit className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">300DPI OUTPUT</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Uses industrial canvas rendering to ensure every line and character is razor-sharp for professional printing.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO SERVER LEAK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">All data stays in your browser memory. We never store or see your client names, rates, or turnover details.</p>
                            </div>
                        </div>
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
