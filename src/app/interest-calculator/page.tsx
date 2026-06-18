import { Metadata } from 'next';
import { TrendingUp, Wallet, HelpCircle, ShieldCheck, Zap, Calculator, Trophy, PieChart, Coins } from 'lucide-react';
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
  alternates: { canonical: 'https://www.gr7imagepdf.com/interest-calculator' }
};

export default function InterestCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Interest Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Calculate simple and compound interest for your investments and loans.
                </p>
            </div>
            
            <InterestCalculator />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Interest Calculator" steps={[
                "Select Type: Choose between 'Simple' or 'Compound' interest mode.",
                "Principal: Enter the initial sum of money you are investing or borrowing.",
                "Rate: Input the annual interest percentage offered.",
                "Tenure: Select the duration in Years or Months.",
                "Result: See your total interest earned and the final maturity amount instantly."
            ]} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Interest Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Precision math for your financial future. Our <strong>Interest Engine</strong> provides instant clarity on your earnings and liabilities.
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
                                    <Coins className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">DUAL LOGIC</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Switch between Simple and Compound interest calculation methods with a single tap for complete versatility.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">INSTANT SYNC</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">All results update in real-time as you type, allowing for quick comparison of different interest rates and terms.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">SECURE MATH</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Calculations run locally on your device. Your financial data is never sent to our servers, ensuring 100% privacy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
