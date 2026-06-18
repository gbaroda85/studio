import { Metadata } from 'next';
import { Landmark, Trophy, HelpCircle, ShieldCheck } from 'lucide-react';
import IncomeTaxCalculator from '@/components/income-tax-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Income Tax Calculator India - New Regime FY 2024-25 Estimates Online',
  description: 'Estimate your income tax liability for Financial Year 2024-25 under the New Tax Regime. Calculate total tax, cess, and slab-wise breakdown instantly.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/income-tax-calculator' }
};

export default function IncomeTaxCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Income Tax Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Quickly estimate your annual tax liability under the New Tax Regime (FY 2024-25).
                </p>
            </div>
            
            <IncomeTaxCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Income Tax Estimator" steps={[
                "Annual Income: Enter your total gross salary/income for the year.",
                "Deductions: Add standard deductions (default 75,000 for FY 24-25).",
                "Review Slabs: See how much income falls into 5%, 10%, 15%, 20% and 30% slabs.",
                "Rebate Check: Auto-check if your income is eligible for Section 87A rebate.",
                "Final Result: See your total base tax plus 4% Health & Education Cess."
            ]} />

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Tax Planning FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which fiscal year does this calculator support?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            This calculator is updated for **Financial Year 2024-25** (Assessment Year 2025-26) based on the latest Indian Budget announcements for the **New Tax Regime**.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is the Section 87A rebate included?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. Under the new regime, if your taxable income is up to **₹7,00,000**, you receive a rebate that makes your final tax liability zero. Our tool accounts for this automatically.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it support Old Tax Regime with 80C deductions?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Currently, this studio focus is on the **New Tax Regime** as it is the default choice for most taxpayers now. Support for the Old Regime with detailed section-wise deductions (80C, 80D, HRA) is coming soon.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
