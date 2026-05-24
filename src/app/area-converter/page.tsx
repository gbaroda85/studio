
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Landmark, Map, Scaling } from 'lucide-react';
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
};

export default function AreaConverterPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex justify-center mb-12 px-4">
            <AreaConverter />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Land Area Converter" steps={[
                "Value: Type the numeric area value you want to convert.",
                "From: Select the current unit (e.g., Sq Ft or Bigha).",
                "To: Select the target unit (e.g., Acre or Hectare).",
                "Instant Update: The result is calculated in real-time as you type.",
                "Accuracy: Precision up to 6 decimal places for official land records."
            ]} />

            {/* AdSense SEO Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Landmark className="text-primary size-8" />
                        Professional Land Measurement Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Understanding land area in different units like <strong>Bigha, Acre, and Hectare</strong> is crucial for property buyers, farmers, and real estate agents in India. Our <strong>Area Studio</strong> provides standardized international and local Indian units with 100% accuracy.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Map className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Local Standards</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Supports local Indian measurements like Bigha and Guntha, which are frequently used in regional property documentation and Bhulekh records.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <Scaling className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Scientific Precision</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses official SI standards for Square Meters and Hectares, ensuring your scientific and architectural data is 100% valid.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculations happen locally in your browser memory. Your property sizes and personal data never leave your device.</p>
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
                        <AccordionTrigger className="text-lg font-bold text-left">How many Square Feet are in 1 Acre?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Exactly **43,560 Square Feet** make up 1 Acre. This is the most common conversion used in real estate and agriculture globally. If you have a plot of 100x100 feet, it is approximately 0.23 acres.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between Acre and Hectare?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            A Hectare is a metric unit of area. **1 Hectare is equal to 2.471 Acres**. While Acres are commonly used in the US and India for general land, Hectares are the primary unit for official agricultural statistics and scientific purposes worldwide.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is "Bigha" the same size everywhere in India?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No, the size of a Bigha varies from state to state (e.g., Rajasthan Bigha vs UP Bigha). Our tool uses a **standardized mathematical unit**, but we always recommend verifying local state land record (Bhulekh) values for final legal documentation.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
