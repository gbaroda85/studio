
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PercentageCalculator from '@/components/percentage-calculator';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Choose Mode: Select the type of calculation you need: 'Simple', 'Part/Whole', 'Marks', or 'Ratio'.",
    "Enter Values: Fill in the required input fields for your chosen mode.",
    "Calculate: Click the 'Calculate' button.",
    "See Result: The result will be instantly displayed below the inputs.",
];

export default function PercentageCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PercentageCalculator />
        </div>
        <HowToGuide title="Percentage Calculator" steps={steps} />
    </main>
  );
}
