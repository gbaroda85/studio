
import { Metadata } from 'next';
import { Landmark, TrendingUp, PieChart, HelpCircle, Calculator, Wallet } from 'lucide-react';
import LoanCalculator from '@/components/loan-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Loan EMI Calculator - Home, Car, Personal Loan EMI Online India',
  description: 'Calculate your monthly EMI, total interest, and total payment for any loan. Simple and accurate financial planning tool with local processing.',
};

export default function LoanCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex justify-center mb-12 px-4">
            <LoanCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Loan & EMI Calculator" steps={[
                "Enter Amount: Input the total loan principal (e.g., 5,00,000).",
                "Set Interest: Add the annual interest rate offered by the bank.",
                "Choose Tenure: Select how many years or months you will pay.",
                "Review: Instantly see your EMI and total interest payable."
            ]} />

            <section className="grid md:grid-cols-3 gap-6">
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-colors">
                    <TrendingUp className="text-primary size-10" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Financial Planning</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Plan your monthly budget by knowing exactly how much you need to pay for your dream home or car.</p>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-colors">
                    <PieChart className="text-emerald-500 size-10" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Interest Breakdown</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">See the difference between your principal amount and the total interest the bank will charge.</p>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/50 transition-colors">
                    <Landmark className="text-rose-500 size-10" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Bank Ready</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Standard formulas used by major Indian banks like SBI, HDFC, and ICICI for EMI calculation.</p>
                </div>
            </section>

            {/* Deep Content Section */}
            <section className="space-y-8 py-10 border-t">
                <h2 className="text-3xl font-black uppercase tracking-tight text-center">Understanding Your EMI</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p className="text-lg leading-relaxed">
                        Equated Monthly Installment (EMI) is the fixed amount you pay to a lender every month until your loan is fully paid off. It consists of two parts: the principal amount and the interest. In the initial years, a larger portion goes toward interest, and as the tenure progresses, more goes toward the principal.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <div className="space-y-4">
                            <h4 className="text-foreground font-black flex items-center gap-2"><Calculator className="size-5 text-primary" /> The Formula</h4>
                            <p className="text-sm">We use the standard formula: <strong>[P x R x (1+R)^N]/[(1+R)^N-1]</strong>, where P is Principal, R is interest rate per month, and N is the number of months.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-foreground font-black flex items-center gap-2"><Wallet className="size-5 text-primary" /> Why use ours?</h4>
                            <p className="text-sm">Our calculator provides a real-time summary without requiring any login or personal details. It works 100% offline in your browser, keeping your financial goals private.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Loan Calculator FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">What is the difference between Flat and Reducing interest rates?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            In a flat rate, interest is calculated on the full principal throughout the tenure. In a reducing rate (used by our tool), interest is calculated on the remaining balance each month. Reducing rates are usually much cheaper for the borrower.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can I use this for Home Loans and Car Loans?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes! This EMI calculator is universal. You can use it for Home Loans (usually 15-30 years), Car Loans (3-7 years), and Personal Loans (1-5 years).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">How can I reduce my monthly EMI?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            You can reduce your EMI by either increasing the loan tenure (though you'll pay more interest total) or by making a higher down payment to reduce the principal amount.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
