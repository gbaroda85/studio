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
import { Gift, Clock, Sparkles, HelpCircle, Cake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Advanced Age Calculator - Exact Years, Months, Days & Life Analytics Online',
  description: 'Discover your exact age with detailed life metrics. Calculate total months, weeks, hours, and seconds lived. Find days left for your next birthday instantly.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/age-calculator' }
};

export default function AgeCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> LIFE ANALYTICS
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
                    Age <span className="text-gradient-hero">Calculator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Find out your exact age in years, months, and days. Explore your lifetime analytics and birthday countdown.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <AgeCalculator />
            </div>
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Advanced Age Calculator" steps={[
                "Select Date: Use our smart year/month dropdown for fast selection.",
                "Calculate: Hit the button to process your lifetime metrics.",
                "Age Summary: See your exact age in a Years/Months/Days breakdown.",
                "Countdown: Check how many days are left until your next celebration.",
                "Life Analytics: Explore total weeks, hours, and seconds lived so far."
            ]} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Beyond Just a Number
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Every day lived is a milestone. Our <strong>Professional Age Studio</strong> uses high-precision date arithmetic to give you a complete perspective.
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
                                    <Gift className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">BIRTHDAY SYNC</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Instantly find out the day of the week for your next birthday to plan your celebrations better.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Sparkles className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">LIFE ANALYTICS</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">See your age expressed in total weeks and minutes—a fascinating look at your progress in life.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <Clock className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">PRECISION MATH</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Our engine handles leap years and variable month lengths with 100% mathematical accuracy.</p>
                            </div>
                        </div>
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
