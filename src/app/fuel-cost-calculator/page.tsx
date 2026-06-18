import { Metadata } from 'next';
import { Gauge, HelpCircle, ShieldCheck, MapPin, Fuel, Trophy } from 'lucide-react';
import FuelCostCalculator from '@/components/fuel-cost-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Fuel Cost Calculator - Estimate Trip Petrol & Diesel Expense Online',
  description: 'Plan your road trip budget with our fuel expense calculator. Calculate required fuel and total cost based on distance and mileage accurately.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/fuel-cost-calculator' }
};

export default function FuelCostCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Fuel Cost Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Plan your road trip budget by calculating estimated petrol and diesel expenses.
                </p>
            </div>
            
            <FuelCostCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Fuel Cost Calculator" steps={[
                "Distance: Enter the total one-way or round-trip distance in Kilometers.",
                "Efficiency: Add your vehicle's average mileage (km per Liter).",
                "Price: Input the current petrol or diesel price in your city.",
                "Calculate: Hit the button to see the total fuel needed and estimated expense.",
                "Optimization: Adjust efficiency to see how much you could save with better driving."
            ]} />
        </div>
    </main>
  );
}
