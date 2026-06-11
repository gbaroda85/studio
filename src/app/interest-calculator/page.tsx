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
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> WEALTH STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Interest <span className="text-gradient-hero">Calculator</span>
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
