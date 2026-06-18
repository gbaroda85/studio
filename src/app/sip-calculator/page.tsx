import { Metadata } from 'next';
import { TrendingUp, Trophy, HelpCircle, ShieldCheck } from 'lucide-react';
import SipCalculator from '@/components/sip-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'SIP Calculator Online - Mutual Fund Investment & Returns Estimate India',
  description: 'Plan your future wealth with our SIP calculator. Estimate maturity value, total returns, and wealth gain based on your monthly investment and expected rate.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/sip-calculator' }
};

export default function SipCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        SIP Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Estimate your future wealth by calculating compound returns on your monthly investments.
                </p>
            </div>
            
            <SipCalculator />
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="SIP Return Calculator" steps={[
                "Monthly Amount: Use the slider to set your monthly SIP investment.",
                "Expected Rate: Input the annual return percentage you expect (e.g., 12%).",
                "Investment Period: Select the number of years you plan to stay invested.",
                "Wealth Gain: View the total invested amount vs estimated returns.",
                "Maturity Value: See the final corpus you could accumulate instantly."
            ]} />

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">SIP Planning FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is a SIP (Systematic Investment Plan)?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            A **SIP** is a method of investing a fixed sum of money regularly in mutual funds. It allows you to take advantage of **Rupee Cost Averaging** and the power of **Compounding**, making it ideal for long-term goals.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How accurate are these estimated returns?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The calculator uses standard mathematical compounding formulas. However, actual mutual fund returns depend on market performance and may vary from the expected percentage you enter.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the Power of Compounding?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Compounding is when the returns on your investment start earning their own returns. The longer you stay invested, the more significant this effect becomes, leading to exponential wealth creation over 10-20 years.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
