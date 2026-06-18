import { Metadata } from 'next';
import { Gauge, HelpCircle, ShieldCheck, Landmark, Target, Trophy } from 'lucide-react';
import FuelConverter from '@/components/fuel-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Fuel Consumption Converter - km/L to MPG (US/UK) Online Free HD',
  description: 'Convert fuel efficiency units instantly. Support for km/L, MPG (US), MPG (UK), and L/100km. Simple vehicle mileage and distance tool.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/fuel-converter' }
};

export default function FuelConverterPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Fuel Converter
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Convert between km/L, MPG, and L/100km efficiency standards instantly.
                </p>
            </div>
            
            <FuelConverter />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Fuel Consumption Converter" steps={[
                "Input: Enter the efficiency number from your vehicle's display.",
                "From Unit: Select the current format (e.g., L/100km).",
                "To Unit: Select the target format (e.g., km/L).",
                "Real-time: The result updates instantly as you change values.",
                "Planning: Use the data for better road trip budgeting."
            ]} />
        </div>
    </main>
  );
}
