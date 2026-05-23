import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InterestCalculator from '@/components/interest-calculator';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Interest Calculator - Simple & Compound Interest Online India',
  description: 'Calculate simple and compound interest for your savings or loans. Get accurate total amounts and breakdowns instantly.',
};

const steps = [
    "Select Type: Choose between 'Simple' or 'Compound'.",
    "Enter Amount: Input the principal sum (Initial amount).",
    "Set Rate: Add the annual interest percentage.",
    "Calculate: Click 'Calculate Interest' to see your earnings.",
];

export default function InterestCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <InterestCalculator />
        </div>
        <HowToGuide title="Interest Calculator" steps={steps} />
    </main>
  );
}
