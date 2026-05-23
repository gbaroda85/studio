import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AreaChart, Target, ShieldCheck, HelpCircle, Landmark, Map, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AreaConverter from '@/components/area-converter';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Area Converter - Acre, Hectare, Bigha, Sq Ft, Sq Meter Units Online India',
  description: 'Convert between different area units like Acres, Hectares, Bigha, Square Feet, and Square Meters. Perfect for land measurements and property records.',
};

export default function AreaConverterPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=converters">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Converters
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <AreaConverter />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="Land Area Converter" steps={[
                "Value: Type the numeric area value you want to convert.",
                "From: Select the current unit (e.g., Sq Ft).",
                "To: Select the target unit (e.g., Acre or Hectare).",
                "Instant Update: The result is calculated in real-time as you type.",
                "Accuracy: Precision up to 6 decimal places for land records."
            ]} />

            {/* AdSense SEO Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Reliable Land Measurement Unit Conversion</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Understanding land area in different units like <strong>Bigha, Acre, and Hectare</strong> is crucial for property buyers and farmers in India. Our converter provides standardized international and local Indian units for 100% accuracy.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Map className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Local Units</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Supports local Indian measurements like Bigha and Guntha for regional property documentation.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Landmark className="text-emerald-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Official Standards</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses SI standards for Square Meters and Hectares as per international measurement norms.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Zap className="text-yellow-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Offline Logic</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculations are mathematical and run in your browser. No data usage for repeated conversions.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Area Conversion FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">How many Square Feet are in 1 Acre?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Exactly **43,560 Square Feet** make up 1 Acre. This is the most common conversion used in real estate and agriculture globally.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">What is the difference between Acre and Hectare?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            A Hectare is a larger metric unit. **1 Hectare is equal to 2.471 Acres**. Hectares are primarily used for official agricultural statistics and scientific purposes.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Is Bigha the same size everywhere in India?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            No, the size of a Bigha varies from state to state (e.g., Bihar Bigha vs UP Bigha). Our tool uses the **standardized mathematical unit**, but always verify local state land record (Bhulekh) values for final legalities.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
