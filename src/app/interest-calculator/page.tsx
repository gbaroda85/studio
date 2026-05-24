
import { Metadata } from 'next';
import { TrendingUp, Wallet, HelpCircle, ShieldCheck, Zap, Calculator } from 'lucide-react';
import InterestCalculator from '@/components/interest-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Interest Calculator - Simple & Compound Interest Online India (HD)',
  description: 'Calculate simple and compound interest for your savings, FDs, or loans instantly. Detailed breakdown of total interest and final amount with 100% privacy.',
};

export default function InterestCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex justify-center mb-12 px-4">
            <InterestCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Interest Calculator" steps={[
                "Select Type: Choose between 'Simple' or 'Compound' interest mode.",
                "Principal: Enter the initial sum of money you are investing or borrowing.",
                "Rate: Input the annual interest percentage offered.",
                "Tenure: Select the duration in Years or Months.",
                "Result: See your total interest earned and the final maturity amount instantly."
            ]} />

            {/* Deep Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <TrendingUp className="text-primary size-8" />
                        Smart Financial Growth Planning
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Understanding how your money grows is the first step to financial freedom. Our <strong>Professional Interest Studio</strong> helps you compare different investment scenarios with mathematical precision.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Calculator className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Dual Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Switch between Simple Interest for basic loans and Compound Interest for power-packed savings and FDs.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Wallet className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Accurate Yield</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculates maturity amounts down to the last rupee, helping you plan for future goals like buying a house or car.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your financial data stays on your device. Calculations run in browser RAM with zero server logging.</p>
                    </div>
                </div>
            </section>

            {/* Educational Content */}
            <section className="bg-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="size-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight">The Power of Compounding</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            Albert Einstein once called Compound Interest the "eighth wonder of the world." Unlike simple interest, which is calculated only on the principal, compound interest is calculated on the principal <strong>plus</strong> the interest accumulated in previous periods. This creates a snowball effect that can significantly boost your wealth over long durations.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Interest FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How is Simple Interest calculated?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Simple Interest (SI) is calculated using the formula: <strong>SI = (P × R × T) / 100</strong>. Here, P is the Principal, R is the annual rate of interest, and T is the time period in years.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">When should I use Compound Interest mode?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Use Compound Interest for most modern financial products like Fixed Deposits (FDs), Savings Accounts, and Mutual Funds. It is the standard method banks use to reward long-term investors.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does this calculator support monthly tenure?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! You can toggle between **Years** and **Months** in the time period section. This is particularly useful for short-term personal loans or recurring deposits.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is my data secure?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. At **GR7 Tools**, we value your privacy. The interest calculation logic runs 100% locally using JavaScript in your browser. No financial figures are ever sent to our servers.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
