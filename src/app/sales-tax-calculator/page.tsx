
import { Metadata } from 'next';
import { HelpCircle, ShieldCheck, BadgeIndianRupee, Percent, ShoppingCart } from 'lucide-react';
import SalesTaxCalculator from '@/components/sales-tax-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Sales Tax & GST Calculator - Calculate Bill Tax and Total Price Online',
  description: 'Quickly calculate sales tax, GST, or VAT amount for any item. Find out the final bill amount with tax-inclusive or exclusive pricing instantly.',
};

export default function SalesTaxCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex justify-center mb-12 px-4">
            <SalesTaxCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Sales Tax Calculator" steps={[
                "Price: Enter the initial price of the product or service.",
                "Tax Rate: Input the tax percentage (e.g., 5, 12, or 18 for GST).",
                "Calculate: Press the button to generate the breakdown.",
                "Result: See the exact tax amount and the final total price combined.",
                "Comparison: Quickly check how different tax rates affect the final bill."
            ]} />

            {/* Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <BadgeIndianRupee className="text-primary size-8" />
                        Professional Billing Accuracy
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Stop doing complex math in your head. Our <strong>Professional Tax Studio</strong> provides instant billing clarity for shoppers, small business owners, and freelancers.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Percent className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">GST Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Perfect for Indian GST slabs (5%, 12%, 18%, 28%). Get exact tax breakdowns for your invoices.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <ShoppingCart className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Budget Friendly</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Know exactly what you'll pay at the checkout counter before standing in line.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Secure</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your business numbers are private. All math happens locally in your device RAM.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Tax Calculation FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the formula for calculating sales tax?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The formula is simple: **Tax Amount = Price × (Tax Rate / 100)**. The Total Price is then **Initial Price + Tax Amount**.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use this for GST in India?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Indian GST is a type of sales tax. Simply enter the GST slab (usually 18 for most services) and your base price to find the GST component.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How is VAT different from Sales Tax?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Mathematically, for a final consumer, they both work the same way. You enter the rate and it is added to the price. This calculator works perfectly for both.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it support reverse tax calculation?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            This tool is currently designed for "Forward Tax" (Price + Tax). For reverse calculation (finding base price from total), stay tuned for our upcoming **Reverse GST Tool**.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
