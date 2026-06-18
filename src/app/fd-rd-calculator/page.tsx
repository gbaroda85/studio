import { Metadata } from 'next';
import FdRdCalculator from '@/components/fd-rd-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PiggyBank, TrendingUp, Trophy, HelpCircle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FD & RD Calculator - Calculate Fixed & Recurring Deposit Returns Online India',
  description: 'Estimate your maturity value for Fixed Deposits (FD) and Recurring Deposits (RD) with precise compounding. Updated with latest banking interest rates logic.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/fd-rd-calculator' }
};

export default function FdRdCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        FD & RD Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Calculate returns on your bank deposits with quarterly and monthly compounding precision.
                </p>
            </div>
            
            <FdRdCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Deposit Return Calculator" steps={[
                "Select Mode: Choose 'Fixed Deposit' for lump-sum or 'Recurring' for monthly savings.",
                "Input Amount: Enter the principal amount or monthly installment.",
                "Set Interest: Input the annual percentage rate (e.g., 7.5% for FD).",
                "Choose Tenure: Select the duration of the deposit in years.",
                "Review Result: Instantly see the maturity amount and total interest earned."
            ]} />

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Investment FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between FD and RD?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            A **Fixed Deposit (FD)** involves investing a lump-sum amount for a fixed period at a higher interest rate. A **Recurring Deposit (RD)** allows you to invest a smaller fixed amount every month, helping you build savings gradually.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How is FD interest calculated in India?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Most Indian banks (like SBI, HDFC, ICICI) use **Quarterly Compounding** for FDs with a tenure of 6 months or more. Our tool uses the standard compound interest formula: *A = P(1 + r/n)^(nt)* where *n=4* for quarterly compounding.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to calculate my private savings here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. **GR7 Tools** is a client-side utility. No numeric data or investment history is ever sent to a server. Your financial planning remains 100% private on your own device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
