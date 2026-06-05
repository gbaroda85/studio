
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
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> CALIBRATION STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Pressure <span className="text-gradient-hero">Converter</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Convert between Bar, PSI, Pascal, and Atmosphere units with high precision.
                </p>
            </div>
            
            <PressureConverter />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Pressure Unit Converter" steps={steps} />
        </div>
    </main>
  );
}
