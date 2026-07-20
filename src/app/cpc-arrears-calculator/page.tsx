import { Metadata } from 'next';
import CpcArrearsCalculator from '@/components/cpc-arrears-calculator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Landmark, Trophy, HelpCircle, ShieldCheck, Zap, TrendingUp, PieChart, Banknote } from 'lucide-react';

export const metadata: Metadata = {
  title: '8th CPC Arrears Calculator - Estimate 8th Pay Commission Hike Online',
  description: 'Calculate your projected salary hike and arrears under the 8th Pay Commission. Support for Serving Employees and Pensioners with Fitment Factor control.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/cpc-arrears-calculator' }
};

export default function CpcArrearsCalculatorPage() {
  const steps = [
    {
      title: "Select Profile",
      description: "Choose between 'Serving Employee' for active service or 'Pensioner' for retired personnel.",
      icon: "Users2"
    },
    {
      title: "Current Pay Input",
      description: "Enter your current 7th CPC Basic Pay or Basic Pension. For serving staff, select the appropriate MSP (0, 5200, 15500).",
      icon: "Banknote"
    },
    {
      title: "Fitment Calibration",
      description: "Use the slider to adjust the fitment factor. Projections range from 1.6 to 4.0 (Standard expectation: 2.57x - 3.00x).",
      icon: "Zap"
    },
    {
      title: "Growth Analysis",
      description: "Review the donut chart to see your monthly hike and new projected gross salary instantly.",
      icon: "PieChart"
    }
  ];

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GR7 8th CPC Arrears Calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Windows, macOS, Android, iOS",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Calculate 8th Pay Commission arrears and salary hike projections for central government employees and pensioners."
  };

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28 text-left w-full">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        
        <ToolNavigation href="/tools?tab=calculator" label="Back to Calculators" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        8th CPC Arrears Calculator
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Estimate your projected 8th Pay Commission salary hike and arrears instantly. 100% Private local math.
                </p>
            </div>
            
            <div className="w-full flex justify-center">
                <CpcArrearsCalculator />
            </div>
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 pb-20 mx-auto">
            <HowToGuide title="8th CPC Arrears Calculator" steps={steps} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Elite Payroll Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        The 8th Pay Commission is expected to bring significant changes to the salary structure of Central Government employees. Our <strong>Professional Arrears Engine</strong> uses projected fitment factors to give you a clear financial vision.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <TrendingUp className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Dynamic Fitment</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Adjust between various fitment factor projections (1.6 to 4.0) to see multiple salary hike scenarios.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <ShieldCheck className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your salary data and financial projections stay entirely in your browser. No data ever reaches a server.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <Zap className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Pension Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Full support for pensioners to calculate their projected basic pension and medical allowance adjustments.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">8th CPC FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">When is the 8th Pay Commission expected?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The 8th Pay Commission is typically expected to be implemented starting from **January 1, 2026**. However, official notifications from the Government of India are awaited for the final implementation dates.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the fitment factor?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The fitment factor is a multiplier used to convert existing basic pay into new basic pay under a new Pay Commission. For the 7th CPC, it was **2.57**. There are projections for the 8th CPC ranging from **2.86 to 3.00** or more.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does this include MSP and Allowances?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. The calculator allows you to select your current **Military Service Pay (MSP)** and add other allowances like HRA and CEA to provide a more accurate estimate of your "Take-home" hike.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
