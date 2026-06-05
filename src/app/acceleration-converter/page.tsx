
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
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> PHYSICS STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Acceleration <span className="text-gradient-hero">Converter</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Convert between meters per second squared, standard gravity, and other motion units.
                </p>
            </div>
            
            <AccelerationConverter />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Acceleration Unit Converter" steps={steps} />
        </div>
    </main>
  );
}
