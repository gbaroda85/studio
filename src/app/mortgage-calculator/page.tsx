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
import { Landmark, Trophy, HelpCircle, ShieldCheck, Sparkles, Building2, Zap } from 'lucide-react';

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
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> REAL ESTATE STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Mortgage <span className="text-gradient-hero">Calculator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Comprehensive home loan estimator with live visualizations and advanced tax logic.
                </p>
            </div>
            
            <MortgageCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Mortgage Calculator" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Building2 className="text-primary size-8" />
                        Professional Home Loan Analysis
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Buying a home is the biggest financial decision of your life. Our <strong>Mortgage Studio</strong> uses high-fidelity financial mapping to give you a complete picture of your 30-year commitment.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Sparkles className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">PITI Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Includes Principal, Interest, Taxes, and Insurance in one comprehensive monthly number.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Zap className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Live Sync</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Sliders and text inputs are locked. Change one, and the entire chart updates instantly without reloads.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your financial goals stay on your device. We do not store or track your loan queries.</p>
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
