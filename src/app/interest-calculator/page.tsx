
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
            <Button asChild variant="outline">
                <Link href="/?tab=calculator">
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
