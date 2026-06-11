import { Metadata } from 'next';
import { Calculator, Trophy } from 'lucide-react';
import StandardCalculator from '@/components/standard-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Standard Calculator Online - Simple Math for Daily Use',
  description: 'A clean and simple online calculator for everyday math. Addition, subtraction, multiplication, and division made easy in your browser.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/standard-calculator' }
};

const steps = [
    "Input: Type numbers or use on-screen buttons.",
    "Operators: Select +, -, *, or /.",
    "Result: Press '=' to get the final calculation.",
    "AC: Use the clear button to start over.",
];

export default function StandardCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> MATH STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Standard <span className="text-gradient-hero">Calculator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    A simple and efficient tool for your everyday mathematical calculations.
                </p>
            </div>
            
            <StandardCalculator />
        </div>

        <div className="w-full max-w-4xl px-4 mx-auto pb-20">
            <HowToGuide title="Standard Calculator" steps={steps} />
        </div>
    </main>
  );
}
