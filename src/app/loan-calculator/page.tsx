
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoanCalculator from '@/components/loan-calculator';
import { HowToGuide } from '@/components/how-to-guide';

const steps = [
    "Enter Loan Amount: Input the total amount of the loan you are considering.",
    "Enter Interest Rate: Add the annual interest rate for the loan.",
    "Enter Tenure: Input the duration of the loan and select whether it's in years or months.",
    "Calculate: Click the 'Calculate EMI' button.",
    "View Details: The calculator will display your monthly payment (EMI), total interest, and total payment.",
];

export default function LoanCalculatorPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50">
                <Link href="/?tab=calculator">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="w-full flex justify-center">
            <LoanCalculator />
        </div>
        <HowToGuide title="Loan & EMI Calculator" steps={steps} />
    </main>
  );
}
