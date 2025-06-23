
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StandardCalculator from '@/components/standard-calculator';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Input Numbers: Use the number buttons to enter your first value.",
    "Select Operator: Click an operator (+, -, *, /).",
    "Input Second Number: Enter the second value for your calculation.",
    "Get Result: Click the '=' button to see the result.",
    "Clear: Use 'AC' to clear the entire calculation and start fresh.",
];

export default function StandardCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20">
                <Link href="/?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <StandardCalculator />
        </div>
        <HowToGuide title="Standard Calculator" steps={steps} />
    </main>
  );
}
