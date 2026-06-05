
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
};

export default function FuelCostCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> TRIP PLANNER STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Fuel Cost <span className="text-gradient-hero">Calculator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
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
