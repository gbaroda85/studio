import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccelerationConverter from '@/components/acceleration-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Acceleration Converter - m/s², km/h², g-force Units Online',
  description: 'Instant acceleration unit conversion. Convert between meters per second squared, standard gravity, and more. Precise and fast.',
};

const steps = [
    "Enter Value: Type the numeric value you want to convert.",
    "Select Units: Choose the 'From' and 'To' acceleration units.",
    "View Result: The converted value is automatically updated.",
    "Units: Supports m/s², g-force, ft/s², and more.",
];

export default function AccelerationConverterPage() {
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
            <AccelerationConverter />
        </div>
        <HowToGuide title="Acceleration Unit Converter" steps={steps} />
    </main>
  );
}
