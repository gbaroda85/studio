
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AreaConverter from '@/components/area-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Area Converter - Acre, Hectare, Sq Ft, Sq Meter Units Online',
  description: 'Convert between different area units like Acres, Hectares, Square Feet, and Square Meters. Perfect for land measurements.',
};

const steps = [
    "Enter Value: Input the area value to be converted.",
    "Choose Units: Select your 'From' and 'To' units.",
    "Instant Result: See the converted value automatically.",
    "Units: Supports Acre, Bigha, Hectare, Sq Ft, and more.",
];

export default function AreaConverterPage() {
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
            <AreaConverter />
        </div>
        <HowToGuide title="Area Unit Converter" steps={steps} />
    </main>
  );
}
