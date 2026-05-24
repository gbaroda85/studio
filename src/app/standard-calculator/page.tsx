
import { Metadata } from 'next';
import StandardCalculator from '@/components/standard-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

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
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />
        <div className="w-full flex justify-center px-4">
            <StandardCalculator />
        </div>
        <div className="w-full max-w-4xl px-4 mx-auto">
            <HowToGuide title="Standard Calculator" steps={steps} />
        </div>
    </main>
  );
}
