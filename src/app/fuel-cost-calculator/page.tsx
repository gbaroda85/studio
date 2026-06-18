import { Metadata } from 'next';
import { Gauge, HelpCircle, ShieldCheck, MapPin, Fuel, Trophy, Zap, Route } from 'lucide-react';
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
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
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

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Fuel Cost Calculator" steps={[
                "Distance: Enter the total one-way or round-trip distance in Kilometers.",
                "Efficiency: Add your vehicle's average mileage (km per Liter).",
                "Price: Input the current petrol or diesel price in your city.",
                "Calculate: Hit the button to see the total fuel needed and estimated expense.",
                "Optimization: Adjust efficiency to see how much you could save with better driving."
            ]} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Trip Planning Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Smart estimates for your road adventures. Our <strong>Fuel Cost Engine</strong> helps you budget with 100% accuracy.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-cyan-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <Route className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">DISTANCE MAP</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Calculate total costs based on exact kilometer inputs for any one-way or round-trip route.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Fuel className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">VOLUME ANALYSIS</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Know exactly how many liters of petrol or diesel you'll need before you reach the pump.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">INSTANT MATH</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Local processing ensures your travel plans and price inputs remain 100% private on your device.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
