import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Fuel, Route, Gauge, HelpCircle, ShieldCheck, Zap, Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FuelCostCalculator from '@/components/fuel-cost-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Fuel Cost Calculator - Estimate Trip Petrol & Diesel Expense Online',
  description: 'Plan your road trip budget with our fuel expense calculator. Calculate required fuel and total cost based on distance and mileage accurately.',
};

export default function FuelCostCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Calculators
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <FuelCostCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="Fuel Cost Calculator" steps={[
                "Distance: Enter the total one-way or round-trip distance in Kilometers.",
                "Efficiency: Add your vehicle's average mileage (km per Liter).",
                "Price: Input the current petrol or diesel price in your city.",
                "Calculate: Hit the button to see the total fuel needed and estimated expense.",
                "Optimization: Adjust efficiency to see how much you could save with better driving."
            ]} />

            {/* Value Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <MapPin className="text-primary size-8" />
                        Plan Your Next Big Adventure
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Don't let unexpected travel costs ruin your mood. Our <strong>Smart Trip Planner</strong> gives you a clear picture of your petrol or diesel spending before you hit the highway.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Gauge className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Mileage Focused</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calibrated for standard Indian vehicle efficiencies (km/L). Perfect for bikes, cars, and SUVs.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-orange-500/50 transition-all">
                        <Fuel className="text-orange-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Price Updates</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Enter real-time local fuel rates to get the most accurate budget for inter-state travels.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Tracking</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your travel plans are personal. Calculations happen locally in your browser with zero data logging.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Travel Budget FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I find my vehicle's real mileage?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            For the most accurate result, use the "tank-to-tank" method. Fill your tank, note the odometer reading, drive 100km, refill, and divide the kilometers driven by the fuel consumed.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Should I calculate for round trip?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! If your destination is 250km away, enter **500km** in the distance field to get the total fuel cost for the entire journey and back.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does driving style affect the calculation?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Definitely. Heavy traffic or high-speed driving can reduce efficiency by 20-30%. We recommend entering a slightly lower efficiency (mileage) than what is claimed by the manufacturer for a safer budget.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use this for diesel and CNG?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This is a mathematical tool. Simply enter the price and efficiency for whichever fuel type you are using.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
