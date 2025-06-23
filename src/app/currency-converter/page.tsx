
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CurrencyConverter from '@/components/currency-converter';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Enter Amount: Type the amount of money you want to convert in the 'Amount' field.",
    "Select 'From' Currency: Choose the currency you are converting from.",
    "Select 'To' Currency: Choose the currency you want to convert to.",
    "View Result: The converted amount is automatically displayed. Note: Rates are for demonstration and not live.",
];

export default function CurrencyConverterPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline">
                <Link href="/?tab=converters">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tools
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <CurrencyConverter />
        </div>
        <HowToGuide title="Currency Converter" steps={steps} />
    </main>
  );
}
