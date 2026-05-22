
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PressureConverter from '@/components/pressure-converter';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Pressure Converter - Bar, PSI, Pa, ATM Units Online',
  description: 'Instant pressure unit conversion. Convert between Pascal, Bar, PSI, and Atmosphere units. Precise and user-friendly converter.',
};

const steps = [
    "Value: Enter the pressure numeric value.",
    "Units: Choose from Pa, Bar, PSI, ATM, or Torr.",
    "Result: View accurate conversion results instantly.",
];

export default function PressureConverterPage() {
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
            <PressureConverter />
        </div>
        <HowToGuide title="Pressure Unit Converter" steps={steps} />
    </main>
  );
}
