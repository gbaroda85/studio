
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FuelCostCalculator from '@/components/fuel-cost-calculator';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Enter Trip Distance: Input the total distance of your trip in kilometers.",
    "Enter Fuel Efficiency: Add your vehicle's average fuel efficiency in kilometers per liter (km/L).",
    "Enter Fuel Price: Input the current price of fuel per liter in your area.",
    "Calculate: Click the 'Calculate Trip Cost' button.",
    "View Results: The calculator will show you the total fuel required for the trip and the estimated total cost.",
];

export default function FuelCostCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline">
                <Link href="/?tab=calculator">
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
