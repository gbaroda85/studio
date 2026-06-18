import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Landmark, Map, Scaling, Trophy } from 'lucide-react';
import AreaConverter from '@/components/area-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Area Converter - Acre, Hectare, Bigha, Sq Ft, Sq Meter Units Online India',
  description: 'Convert between different area units like Acres, Hectares, Bigha, Square Feet, and Square Meters. Perfect for land measurements and property records.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/area-converter' }
};

export default function AreaConverterPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Area Converter
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Convert between international and local Indian land units like Bigha, Acre, and Hectare.
                </p>
            </div>
            
            <AreaConverter />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Land Area Converter" steps={[
                "Value: Type the numeric area value you want to convert.",
                "From: Select the current unit (e.g., Sq Ft or Bigha).",
                "To: Select the target unit (e.g., Acre or Hectare).",
                "Instant Update: The result is calculated in real-time as you type.",
                "Accuracy: Precision up to 6 decimal places for official land records."
            ]} />
        </div>
    </main>
  );
}
