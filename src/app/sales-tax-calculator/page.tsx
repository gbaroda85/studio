
import { Metadata } from 'next';
import { HelpCircle, ShieldCheck, BadgeIndianRupee, Percent, ShoppingCart, Trophy } from 'lucide-react';
import SalesTaxCalculator from '@/components/sales-tax-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Sales Tax & GST Calculator - Calculate Bill Tax and Total Price Online',
  description: 'Quickly calculate sales tax, GST, or VAT amount for any item. Find out the final bill amount with tax-inclusive or exclusive pricing instantly.',
};

export default function SalesTaxCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> TAX STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    GST & Sales <span className="text-gradient-hero">Tax Calculator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Quickly calculate tax-inclusive or exclusive pricing for any product or service.
                </p>
            </div>
            
            <SalesTaxCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Sales Tax Calculator" steps={[
                "Price: Enter the initial price of the product or service.",
                "Tax Rate: Input the tax percentage (e.g., 5, 12, or 18 for GST).",
                "Calculate: Press the button to generate the breakdown.",
                "Result: See the exact tax amount and the final total price combined.",
                "Comparison: Quickly check how different tax rates affect the final bill."
            ]} />
        </div>
    </main>
  );
}
