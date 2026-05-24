import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Fuel, Gauge, Zap, HelpCircle, ShieldCheck, Target, Droplets, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FuelConverter from '@/components/fuel-converter';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Fuel Consumption Converter - km/L to MPG (US/UK) Online Free HD',
  description: 'Convert fuel efficiency units instantly. Support for km/L, MPG (US), MPG (UK), and L/100km. Simple vehicle mileage and distance tool.',
};

export default function FuelConverterPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=converters">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Converters
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <FuelConverter />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="Fuel Consumption Converter" steps={[
                "Input: Enter the efficiency number from your vehicle's display.",
                "From Unit: Select the current format (e.g., L/100km).",
                "To Unit: Select the target format (e.g., km/L).",
                "Real-time: The result updates instantly as you change values.",
                "Planning: Use the data for better road trip budgeting."
            ]} />

            {/* AdSense SEO Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Gauge className="text-primary size-8" />
                        Analyze Your Vehicle Efficiency
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Many modern European and luxury cars display efficiency in <strong>L/100km</strong>, while most Indian and Asian users prefer <strong>km/L (Mileage)</strong>. Our <strong>Fuel Studio</strong> bridges this gap by providing instant conversion between all major efficiency standards.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Landmark className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Dashboard Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Quickly translate "Liters per 100km" from your car's screen into "Kilometers per Liter" that we use for daily fueling.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/50 transition-all">
                        <Target className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Global Units</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Switch between MPG (US) and MPG (UK) for imported vehicles and comparing international car reviews.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculations happen entirely in your browser's RAM. No data logging, history tracking, or server uploads.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Fuel Conversion FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between MPG (US) and MPG (UK)?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            A US Gallon is smaller than a UK (Imperial) Gallon. Therefore, **1 MPG (UK) is approximately 1.201 MPG (US)**. If a car review from the UK says 50 MPG, it would be around 41.6 MPG in US units. Our tool handles this gravity difference automatically.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I convert L/100km to km/L?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            It is an inverse relationship. Simply divide 100 by the L/100km value. For example, if your car shows 10 L/100km, the mileage is **100 / 10 = 10 km/L**. Lower L/100km numbers mean better fuel efficiency.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why does my mileage drop in winter?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Cold air increases aerodynamic drag, and engines take longer to reach efficient operating temperatures. This often results in a 10-15% drop in efficiency, which you can track by using this converter to compare seasonal data.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
