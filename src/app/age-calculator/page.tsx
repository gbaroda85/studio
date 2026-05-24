
import { Metadata } from 'next';
import { Calendar, HelpCircle, Gift, Clock } from 'lucide-react';
import AgeCalculator from '@/components/age-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Age Calculator Online - Exact Age in Years, Months, Days',
  description: 'Calculate your exact age and find out days left for your next birthday. Simple, accurate, and free online tool with local calculation.',
};

export default function AgeCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <AgeCalculator />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Age Calculator" steps={[
                "Select Date: Click the input to open the calendar.",
                "Pick Birthday: Choose your birth date and year.",
                "Calculate: Click 'Calculate Age' to see instant results.",
                "Review: See your age in years, months, and days.",
            ]} />

            {/* Detailed Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">More Than Just Years</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Our advanced age calculator doesn't just subtract years. It performs complex date arithmetic to give you your exact age down to the day.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3">
                        <Gift className="text-primary size-8" />
                        <h3 className="font-bold">Birthday Countdown</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Get to know exactly how many days are left until your next big celebration.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3">
                        <Calendar className="text-blue-500 size-8" />
                        <h3 className="font-bold">Birth Day Finder</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Ever wondered what day of the week you were born on? We reveal it instantly.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3">
                        <Clock className="text-orange-500 size-8" />
                        <h3 className="font-bold">Precise Breakdown</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">See your age expressed in total months and days for more detailed documentation.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Age Calculator FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Is this calculator accurate for leap years?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes, our logic uses standard date-fns libraries that automatically account for leap years and different month lengths (28, 30, or 31 days).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why do I need to know my age in days?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Certain legal applications and medical forms require your exact age in months or days for precise eligibility checking.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Does this tool store my birth date?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            No. Just like our image tools, the age calculation happens 100% locally in your browser. We do not store or track any dates you enter.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
