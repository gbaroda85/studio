import { Metadata } from 'next';
import AgeCalculator from '@/components/age-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Gift, Clock, Sparkles, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Advanced Age Calculator - Exact Years, Months, Days & Life Analytics Online',
  description: 'Discover your exact age with detailed life metrics. Calculate total months, weeks, hours, and seconds lived. Find days left for your next birthday instantly.',
};

export default function AgeCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <AgeCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Advanced Age Calculator" steps={[
                "Select Date: Use our smart year/month dropdown for fast selection.",
                "Calculate: Hit the button to process your lifetime metrics.",
                "Age Summary: See your exact age in a Years/Months/Days breakdown.",
                "Countdown: Check how many days are left until your next celebration.",
                "Life Analytics: Explore total weeks, hours, and seconds lived so far."
            ]} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Beyond Just a Number
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Every day lived is a milestone. Our <strong>Professional Age Studio</strong> uses high-precision date arithmetic to give you a complete perspective of your time.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Gift className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Birthday Sync</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Instantly find out the day of the week for your next birthday to plan your celebrations better.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Sparkles className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Life Analytics</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">See your age expressed in total weeks and minutes—a fascinating look at your progress in life.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <Clock className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Precision Math</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our engine handles leap years and variable month lengths with 100% mathematical accuracy.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Age Calculation FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How accurate is the 'Seconds' calculation?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We use the standard Unix timestamp logic to calculate the absolute difference between your birth date and the current moment. This ensures a precision of **1 second**.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does this tool support leap years?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Our calculation logic automatically accounts for the extra day in February every four years, ensuring your age in days is 100% correct.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to enter my birth date?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. **GR7 Tools** processes everything locally in your browser. Your birth date is never sent to a server or stored in a database.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
