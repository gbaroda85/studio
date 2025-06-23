
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgeCalculator from '@/components/age-calculator';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Select Date: Click on the date input field to open the calendar.",
    "Pick Your Birthday: Navigate through the months and years and select your date of birth.",
    "Calculate: Click the 'Calculate Age' button.",
    "View Results: Your age in years, months, and days, along with your next birthday and the day you were born, will be displayed.",
];

export default function AgeCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=calculator">
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
