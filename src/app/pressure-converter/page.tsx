import { Metadata } from 'next';
import { Waves, ShieldCheck, HelpCircle, Activity, MonitorCheck, Trophy } from 'lucide-react';
import PressureConverter from '@/components/pressure-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Pressure Converter - Bar, PSI, Pa, ATM Units Online HD',
  description: 'Instant pressure unit conversion. Convert between Pascal, Bar, PSI, and Atmosphere units. Precise for industrial and automotive use.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/pressure-converter' }
};

export default function PressureConverterPage() {
  const steps = [
    "Value: Enter the pressure numeric value.",
    "From Unit: Choose current unit (e.g., PSI for tyres).",
    "To Unit: Choose target unit (e.g., Bar).",
    "Result: View accurate conversion results instantly.",
    "Precision: All calculations use high-precision floating point math."
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Pressure Converter
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Convert between Bar, PSI, Pascal, and Atmosphere units with high precision.
                </p>
            </div>
            
            <PressureConverter />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Pressure Unit Converter" steps={steps} />
        </div>
    </main>
  );
}
