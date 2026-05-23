import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Fuel, Gauge, Zap, HelpCircle, ShieldCheck, Target, Droplets } from 'lucide-react';
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
  title: 'Fuel Consumption Converter - km/L to MPG (US/UK) Online Free',
  description: 'Convert fuel efficiency units instantly. Support for km/L, MPG (US), MPG (UK), and L/100km. Simple vehicle mileage and mileage tool.',
};

export default function FuelConverterPage() {
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
            <FuelConverter />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="Fuel Consumption Converter" steps={[
                "Input: Enter the efficiency number from your vehicle's display.",
                "From: Select current unit (e.g., L/100km).",
                "To: Select target unit (e.g., km/L).",
                "Real-time: Result updates instantly as you change values.",
                "Precision: Get accurate results for better travel budgeting."
            ]} />

            {/* AdSense SEO Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Understand Your Vehicle's Real Efficiency</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Many modern cars display efficiency in <strong>L/100km</strong>, while most users prefer <strong>km/L (Mileage)</strong>. Our tool bridges this gap by providing instant conversion between all major efficiency standards.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Gauge className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Dashboard Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Quickly translate "L/100km" from your car's screen into "km per liter" that we use daily.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Target className="text-rose-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">International Units</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Switch between MPG (US) and MPG (UK) for imported vehicles and international comparisons.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-teal-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculations happen entirely in your browser's RAM. No data logging or tracking.</p>
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
                        <AccordionTrigger className="text-lg font-bold">What is the difference between MPG (US) and MPG (UK)?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            The US Gallon is smaller than the UK (Imperial) Gallon. Therefore, **1 MPG (UK) is approximately 0.83 MPG (US)**. Our tool handles this specific gravity difference automatically.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">How to convert L/100km to km/L?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            It is an inverse relationship. Simply divide 100 by the L/100km value. For example, if your car shows 10 L/100km, then **100 / 10 = 10 km/L**.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why use this instead of a normal calculator?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Our tool eliminates manual calculation errors and handles complex conversions like Miles to Kilometers and Gallons to Liters simultaneously in one step.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
