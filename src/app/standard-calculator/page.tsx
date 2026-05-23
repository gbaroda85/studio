import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StandardCalculator from '@/components/standard-calculator';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Standard Calculator Online - Simple Math for Daily Use',
  description: 'A clean and simple online calculator for everyday math. Addition, subtraction, multiplication, and division made easy in your browser.',
};

const steps = [
    "Input: Type numbers or use on-screen buttons.",
    "Operators: Select +, -, *, or /.",
    "Result: Press '=' to get the final calculation.",
    "AC: Use the clear button to start over.",
];

export default function StandardCalculatorPage() {
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
            <StandardCalculator />
        </div>
        <HowToGuide title="Standard Calculator" steps={steps} />
    </main>
  );
}
