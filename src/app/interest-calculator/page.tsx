import { Metadata } from 'next';
import { TrendingUp, Wallet, HelpCircle, ShieldCheck, Zap, Calculator, Trophy } from 'lucide-react';
import InterestCalculator from '@/components/interest-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Interest Calculator - Simple & Compound Interest Online India (HD)',
  description: 'Calculate simple and compound interest for your savings, FDs, or loans instantly. Detailed breakdown of total interest and final amount with 100% privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/interest-calculator' }
};

export default function InterestCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Interest Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Calculate simple and compound interest for your investments and loans.
                </p>
            </div>
            
            <InterestCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Interest Calculator" steps={[
                "Select Type: Choose between 'Simple' or 'Compound' interest mode.",
                "Principal: Enter the initial sum of money you are investing or borrowing.",
                "Rate: Input the annual interest percentage offered.",
                "Tenure: Select the duration in Years or Months.",
                "Result: See your total interest earned and the final maturity amount instantly."
            ]} />
        </div>
    </main>
  );
}
