
import { Metadata } from 'next';
import { Percent, HelpCircle, ShieldCheck, GraduationCap, Coins } from 'lucide-react';
import PercentageCalculator from '@/components/percentage-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Percentage Calculator - Marks, Ratios, School Result & GST Percentages',
  description: 'Calculate percentages for exam marks, discount ratios, and profit/loss instantly. Perfect for students and professional financial calculations.',
};

export default function PercentageCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PercentageCalculator />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Percentage Calculator" steps={[
                "Select Mode: Choose 'Simple', 'Part/Whole', 'Marks', or 'Ratio'.",
                "Input Data: Enter the numbers for your specific calculation.",
                "Calculate: Hit the button for an instant result.",
                "Reset: Use the clear button for a new fresh calculation."
            ]} />

            {/* AdSense SEO Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Versatile Math for Every Day</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Whether you are a student calculating your <strong>Board Exam percentage</strong> or a shopper finding a <strong>Sales Discount</strong>, our tool provides error-free results instantly.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <GraduationCap className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Exam Scores</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Quickly find the percentage of marks obtained in Class 10th or 12th Board exams with the Marks mode.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Coins className="text-yellow-600 size-8" />
                        <h3 className="font-bold uppercase text-sm">Discount & Tax</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculate GST, VAT, or simple discounts for shopping and business budgeting.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-teal-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculations run locally. No data is stored or tracked, keeping your numbers private.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Percentage FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">How to calculate marks percentage manually?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            The formula is: **(Marks Obtained / Total Marks) * 100**. Our "Marks" mode does this for you automatically.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">What does "Part/Whole" mean?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            This mode tells you what percentage one number is of another. For example, if you want to know what % is 40 of 200, this mode will give you 20%.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can I use this for GST calculation?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes! Use the "Simple" mode. Enter the tax rate (e.g., 18) and the base amount to find out the exact tax value.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
