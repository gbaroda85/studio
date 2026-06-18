import { Metadata } from 'next';
import { IndianRupee, Trophy, HelpCircle, ShieldCheck } from 'lucide-react';
import GstCalculator from '@/components/gst-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'GST Calculator Online - Add or Remove GST (5%, 12%, 18%, 28%) India',
  description: 'Instant GST calculation for Indian business. Calculate Net amount, Tax amount, and Gross total. Supports CGST and SGST breakdown with 100% privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/gst-calculator' }
};

export default function GstCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        GST Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Quickly add or remove GST from your bills with CGST/SGST breakdown.
                </p>
            </div>
            
            <GstCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="GST Calculator" steps={[
                "Select Mode: Choose 'Add GST' for inclusive price or 'Remove GST' for exclusive.",
                "Input Amount: Enter the initial numeric value (Base or Total).",
                "Select Slab: Pick from 5%, 12%, 18%, or 28% tax rates.",
                "Review Breakdown: See Net Amount, CGST, SGST and Final Total instantly.",
                "Accuracy: All results are rounded as per standard accounting rules."
            ]} />

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">GST Calculation FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between Adding and Removing GST?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            **Add GST** is used when you have the base price and want to find the final price after adding tax. **Remove GST** (Exclusive) is used when you have the final MRP and want to find how much the base price and tax were within that amount.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does this tool show CGST and SGST?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! For intra-state transactions, the GST is split equally into **CGST** (Central) and **SGST** (State). Our tool automatically calculates this 50/50 split for your convenience.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to use for my business bills?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. **GR7 Tools** is a client-side utility. No numeric data or calculation history is sent to any server. Your financial planning remains private on your device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
