
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SalesTaxCalculator from '@/components/sales-tax-calculator';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Enter Initial Price: Input the price of the item before tax.",
    "Enter Tax Rate: Add the sales tax rate as a percentage.",
    "Calculate: Click the 'Calculate Tax' button.",
    "View Results: The calculator will show you the tax amount and the final total price.",
];

export default function SalesTaxCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20">
                <Link href="/?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <SalesTaxCalculator />
        </div>
        <HowToGuide title="Sales Tax Calculator" steps={steps} />
    </main>
  );
}
