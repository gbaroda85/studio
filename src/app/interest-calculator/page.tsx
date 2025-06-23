
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InterestCalculator from '@/components/interest-calculator';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Select Interest Type: Choose between 'Simple' or 'Compound' interest.",
    "Enter Principal: Input the initial amount of money.",
    "Enter Rate: Add the annual interest rate.",
    "Enter Time Period: Input the duration and select whether it's in years or months.",
    "Calculate: Click the 'Calculate Interest' button.",
    "View Results: The calculator will show you the total interest earned and the final total amount.",
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
