
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PressureConverter from '@/components/pressure-converter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Enter Value: Type the numeric value you want to convert in the 'Value' field.",
    "Select From Unit: Choose the starting unit of pressure from the first dropdown.",
    "Select To Unit: Choose the target unit of pressure from the second dropdown.",
    "View Result: The converted value is automatically displayed in the result box.",
];

export default function PressureConverterPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=converters">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <PressureConverter />
        </div>
        <HowToGuide title="Pressure Unit Converter" steps={steps} />
    </main>
  );
}
