import { Metadata } from 'next';
import { Activity, Target, ShieldCheck, HelpCircle, Waves, Trophy } from 'lucide-react';
import AccelerationConverter from '@/components/acceleration-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Acceleration Converter - m/s², km/h², g-force Units Online HD',
  description: 'Instant acceleration unit conversion. Convert between meters per second squared, standard gravity, and more. Precise and fast for physics and engineering.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/acceleration-converter' }
};

export default function AccelerationConverterPage() {
  const steps = [
    "Input Value: Enter the numeric acceleration value.",
    "Select Units: Choose the starting unit (e.g., m/s²).",
    "Target Unit: Choose the target unit (e.g., G-force).",
    "Instant Result: View the mathematically accurate conversion.",
    "Precision: All results are shown up to 6 decimal places."
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Acceleration Converter
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Convert between meters per second squared, standard gravity, and other motion units.
                </p>
            </div>
            
            <AccelerationConverter />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Acceleration Unit Converter" steps={steps} />
        </div>
    </main>
  );
}
