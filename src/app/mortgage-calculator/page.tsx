import { Metadata } from 'next';
import MortgageCalculator from '@/components/mortgage-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Landmark, Trophy, HelpCircle, ShieldCheck, Sparkles, Building2, Zap, PieChart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Comprehensive Mortgage Calculator - Estimate Home Loans & Interest Online',
  description: 'Calculate your total monthly mortgage payment including interest, taxes, insurance, and HOA. Features live charts and side-by-side repayment analysis.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/mortgage-calculator' }
};

export default function MortgageCalculatorPage() {
  const steps = [
    "Home Value: Enter the total cost of the property.",
    "Equity: Set your down payment as a percentage or fixed dollar amount.",
    "Term & Rate: Choose your fixed loan period and bank's annual interest rate.",
    "Escrow: Toggle the advanced section to include Taxes and Insurance.",
    "Visual Audit: Analyze the donut chart to see where your money goes monthly."
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Mortgage Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Comprehensive home loan estimator with live visualizations and advanced tax logic.
                </p>
            </div>
            
            <MortgageCalculator />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Mortgage Calculator" steps={steps} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Premium Mortgage Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Buying a home is a major milestone. Our <strong>Professional Mortgage Engine</strong> provides a complete picture of your 30-year commitment.
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
                                    <Sparkles className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">PITI READY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Includes Principal, Interest, Taxes, and Insurance in one comprehensive monthly number.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">LIVE SYNC</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Sliders and inputs are locked. Change one, and the entire chart updates instantly without reloads.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% PRIVATE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your financial calculations stay on your device. We do not store or track your personal loan queries.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Mortgage FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Should I choose 15 or 30 years?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            A **15-year mortgage** usually has lower interest rates but significantly higher monthly payments. A **30-year mortgage** is the most common because it offers flexibility and lower monthly costs, though you pay much more interest over the long run.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What does the chart breakdown show?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The chart breaks down your **PITI** (Principal, Interest, Taxes, and Insurance). Most people forget that taxes and insurance can add 20-30% to the core loan payment. Our tool makes these costs visible.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How accurate is the interest calculation?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We use the standard amortization formula used by major banks globally. While local bank fees or private mortgage insurance (PMI) might vary slightly, our calculation provides a high-fidelity estimate within 99% accuracy.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
