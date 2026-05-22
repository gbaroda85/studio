
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgeCalculator from '@/components/age-calculator';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Age Calculator Online - Exact Age in Years, Months, Days',
  description: 'Calculate your exact age and find out days left for your next birthday. Simple, accurate, and free online tool with local calculation.',
};

const steps = [
    "Select Date: Click the input to open the calendar.",
    "Pick Birthday: Choose your birth date and year.",
    "Calculate: Click 'Calculate Age' to see instant results.",
    "Review: See your age in years, months, and days.",
];

export default function AgeCalculatorPage() {
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
            <AgeCalculator />
        </div>
        <HowToGuide title="Age Calculator" steps={steps} />
    </main>
  );
}
