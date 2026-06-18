import { Metadata } from 'next';
import FdRdCalculator from '@/components/fd-rd-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PiggyBank, TrendingUp, Trophy, HelpCircle, ShieldCheck, Zap, PieChart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FD & RD Calculator - Calculate Fixed & Recurring Deposit Returns Online India',
  description: 'Estimate your maturity value for Fixed Deposits (FD) and Recurring Deposits (RD) with precise compounding. Updated with latest banking interest rates logic.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/fd-rd-calculator' }
};

export default function FdRdCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        FD & RD Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Calculate returns on your bank deposits with quarterly and monthly compounding precision.
                </p>
            </div>
            
            <FdRdCalculator />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Deposit Return Calculator" steps={[
                "Select Mode: Choose 'Fixed Deposit' for lump-sum or 'Recurring' for monthly savings.",
                "Input Amount: Enter the principal amount or monthly installment.",
                "Set Interest: Input the annual percentage rate (e.g., 7.5% for FD).",
                "Choose Tenure: Select the duration of the deposit in years.",
                "Review Result: Instantly see the maturity amount and total interest earned."
            ]} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Advanced Savings Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Plan your savings with confidence. Our <strong>Professional Deposit Engine</strong> uses high-fidelity compound interest mapping for Indian banking standards.
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
                                    <TrendingUp className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">QUARTERLY SYNC</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Our engine uses standard Indian banking formulas with quarterly compounding for the most accurate maturity estimates.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <PieChart className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">YIELD RATIO</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">See the exact ratio of your invested principal versus the interest earned over the chosen tenure visually.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% PRIVATE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your investment plans stay on your device. We do not store or track your numeric queries on our servers.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Investment FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the difference between FD and RD?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            A **Fixed Deposit (FD)** involves investing a lump-sum amount for a fixed period at a higher interest rate. A **Recurring Deposit (RD)** allows you to invest a smaller fixed amount every month, helping you build savings gradually.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How is FD interest calculated in India?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Most Indian banks (like SBI, HDFC, ICICI) use **Quarterly Compounding** for FDs with a tenure of 6 months or more. Our tool uses the standard compound interest formula: *A = P(1 + r/n)^(nt)* where *n=4* for quarterly compounding.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to calculate my private savings here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. **GR7 Tools** is a client-side utility. No numeric data or investment history is ever sent to a server. Your financial planning remains 100% private on your own device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
