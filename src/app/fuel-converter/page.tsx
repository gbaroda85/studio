
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FuelConverter from '@/components/fuel-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Fuel Consumption Converter - km/L to MPG Online Free',
  description: 'Convert fuel efficiency units instantly. Support for km/L, MPG (US), MPG (UK), and L/100km. Simple vehicle mileage tool.',
};

const steps = [
    "Enter Value: Input the efficiency number to convert.",
    "Select Units: Choose between km/L, MPG, or L/100km.",
    "Instant Result: The tool updates results as you type.",
];

export default function FuelConverterPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=converters">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <FuelConverter />
        </div>
        <HowToGuide title="Fuel Consumption Converter" steps={steps} />
    </main>
  );
}
