
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FuelCostCalculator from '@/components/fuel-cost-calculator';
import { HowToGuide } from '@/components/how-to-guide';

export const metadata: Metadata = {
  title: 'Fuel Cost Calculator - Estimate Trip Petrol & Diesel Expense',
  description: 'Plan your road trip budget. Calculate fuel required and estimated total cost based on distance and mileage.',
};

const steps = [
    "Distance: Input the trip distance in Kilometers.",
    "Efficiency: Add your vehicle's average mileage (km/L).",
    "Price: Input current fuel price per liter.",
    "Calculate: Click 'Calculate Trip Cost' to get your estimate.",
];

export default function FuelCostCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/tools?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <FuelCostCalculator />
        </div>
        <HowToGuide title="Fuel Cost Calculator" steps={steps} />
    </main>
  );
}
