
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PercentageCalculator from '@/components/percentage-calculator';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Percentage Calculator - Marks, Ratios & School Result Percentages',
  description: 'Calculate percentages for marks, ratios, and fractions instantly. Perfect for students and professional calculations.',
};

const steps = [
    "Choose Mode: Select between 'Simple', 'Marks', or 'Ratio'.",
    "Enter Values: Fill in the numbers required for your calculation.",
    "Calculate: Click 'Calculate' to see the result instantly.",
    "Clear: Use the reset button for a fresh calculation.",
];

export default function PercentageCalculatorPage() {
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
            <PercentageCalculator />
        </div>
        <HowToGuide title="Percentage Calculator" steps={steps} />
    </main>
  );
}
