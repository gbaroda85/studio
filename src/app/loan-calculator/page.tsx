
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Landmark, TrendingUp, PieChart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoanCalculator from '@/components/loan-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';

export const metadata: Metadata = {
  title: 'Loan EMI Calculator - Home, Car, Personal Loan EMI Online India',
  description: 'Calculate your monthly EMI, total interest, and total payment for any loan. Simple and accurate financial planning tool with local processing.',
};

export default function LoanCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20">
                <Link href="/tools?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Calculators
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <LoanCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-12">
            <HowToGuide title="Loan & EMI Calculator" steps={[
                "Enter Amount: Input the total loan principal (e.g., 5,00,000).",
                "Set Interest: Add the annual interest rate offered by the bank.",
                "Choose Tenure: Select how many years or months you will pay.",
                "Review: Instantly see your EMI and total interest payable."
            ]} />

            <section className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 shadow-xl space-y-4">
                    <TrendingUp className="text-primary size-8" />
                    <h3 className="font-black uppercase text-sm">Financial Planning</h3>
                    <p className="text-xs text-muted-foreground">Plan your monthly budget by knowing exactly how much you need to pay for your dream home or car.</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 shadow-xl space-y-4">
                    <PieChart className="text-emerald-500 size-8" />
                    <h3 className="font-black uppercase text-sm">Interest Breakdown</h3>
                    <p className="text-xs text-muted-foreground">See the difference between your principal amount and the total interest the bank will charge.</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 shadow-xl space-y-4">
                    <Landmark className="text-rose-500 size-8" />
                    <h3 className="font-black uppercase text-sm">Bank Ready</h3>
                    <p className="text-xs text-muted-foreground">Standard formulas used by major Indian banks like SBI, HDFC, and ICICI for EMI calculation.</p>
                </div>
            </section>
        </div>
    </main>
  );
}
