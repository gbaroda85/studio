import { Metadata } from 'next';
import { Landmark, TrendingUp, PieChart, HelpCircle, Calculator, Wallet, Trophy } from 'lucide-react';
import LoanCalculator from '@/components/loan-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Loan EMI Calculator - Home, Car, Personal Loan EMI Online India',
  description: 'Calculate your monthly EMI, total interest, and total payment for any loan. Simple and accurate financial planning tool with local processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/loan-calculator' }
};

export default function LoanCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Loan EMI Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Calculate your monthly loan payments and interest breakdowns with precision.
                </p>
            </div>
            
            <LoanCalculator />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Loan & EMI Calculator" steps={[
                "Enter Amount: Input the total loan principal (e.g., 5,00,000).",
                "Set Interest: Add the annual interest rate offered by the bank.",
                "Choose Tenure: Select how many years or months you will pay.",
                "Review: Instantly see your EMI and total interest payable."
            ]} />

            <section className="grid md:grid-cols-3 gap-6">
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-colors">
                    <TrendingUp className="text-primary size-10" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Financial Planning</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Plan your monthly budget by knowing exactly how much you need to pay for your dream home or car.</p>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-colors">
                    <PieChart className="text-emerald-500 size-10" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Interest Breakdown</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">See the difference between your principal amount and the total interest the bank will charge.</p>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/50 transition-colors">
                    <Landmark className="text-rose-500 size-10" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Bank Ready</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Standard formulas used by major Indian banks like SBI, HDFC, and ICICI for EMI calculation.</p>
                </div>
            </section>
        </div>
    </main>
  );
}
