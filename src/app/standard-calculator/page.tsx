import { Metadata } from 'next';
import { Calculator, Trophy, ShieldCheck, HelpCircle, Zap, Monitor, Activity } from 'lucide-react';
import StandardCalculator from '@/components/standard-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Standard Calculator Online - Simple Math for Daily Use',
  description: 'A clean and simple online calculator for everyday math. Addition, subtraction, multiplication, and division made easy in your browser.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/standard-calculator' }
};

const steps = [
    "Input: Type numbers or use on-screen buttons.",
    "Operators: Select +, -, *, or /.",
    "Result: Press '=' to get the final calculation.",
    "AC: Use the clear button to start over.",
];

export default function StandardCalculatorPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Standard Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-base">
                    A simple and efficient tool for your everyday mathematical calculations.
                </p>
            </div>
            
            <div className="w-full flex justify-center">
                <StandardCalculator />
            </div>
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="Standard Calculator" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Math Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Our <strong>Professional Studio</strong> provides a clutter-free environment for exact arithmetic with 100% data privacy.
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
                                    <Zap className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">INSTANT RESULTS</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Calculations happen in real-time as you type or click, providing immediate feedback for your math queries.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Monitor className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">CLEAN INTERFACE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Designed for readability and ease of use on both desktop and mobile devices without annoying ads or popups.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% PRIVATE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">All calculations are performed locally in your browser. Your numbers and operations never leave your device.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Calculator FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe for private financial math?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. This is a **Client-Side** utility. Every operation happens in your browser's temporary memory. We don't have a database for your calculations.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Does it support long decimal numbers?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Yes. The engine handles high-precision floating point arithmetic, ensuring your division and multiplication results are accurate for daily use.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Can I use keyboard shortcuts?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Currently, the tool is optimized for touch and click interactions. Full keyboard support for numpad usage is part of our upcoming studio update.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
