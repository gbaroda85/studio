
import { Metadata } from 'next';
import { Activity, Target, ShieldCheck, HelpCircle, Waves } from 'lucide-react';
import AccelerationConverter from '@/components/acceleration-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Acceleration Converter - m/s², km/h², g-force Units Online HD',
  description: 'Instant acceleration unit conversion. Convert between meters per second squared, standard gravity, and more. Precise and fast for physics and engineering.',
};

export default function AccelerationConverterPage() {
  const steps = [
    "Input Value: Enter the numeric acceleration value.",
    "Select Units: Choose the starting unit (e.g., m/s²).",
    "Target Unit: Choose the target unit (e.g., G-force).",
    "Instant Result: View the mathematically accurate conversion.",
    "Precision: All results are shown up to 6 decimal places."
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex justify-center mb-12 px-4">
            <AccelerationConverter />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Acceleration Unit Converter" steps={steps} />

            {/* Deep Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Activity className="text-primary size-8" />
                        Precision Motion Physics
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Whether you are an engineering student or a physics enthusiast, understanding the rate of change of velocity is key. Our <strong>Professional Acceleration Studio</strong> provides standardized conversions between SI and imperial units instantly.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Target className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Physics Standard</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses exact mathematical constants for m/s² and ft/s² as per international SI measurement protocols.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Waves className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">G-Force Logic</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Instantly convert standard units to 'g' (Standard Gravity), essential for aviation and automotive testing.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Offline</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All math runs in your browser RAM. Your data is private and the results are returned at native hardware speed.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Acceleration FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is 1 'g' of acceleration?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            1 'g' is the acceleration due to Earth's gravity at sea level. It is approximately equal to **9.80665 meters per second squared (m/s²)**. It is a standard unit used to measure the forces experienced by pilots and race car drivers.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why use m/s² instead of km/h?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Km/h measures speed (velocity), whereas **m/s²** measures the **rate** at which that speed changes. Meters per second squared is the official SI unit for acceleration used in almost all scientific and engineering calculations.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use this for automotive 0-100 testing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! If you have the average acceleration value of a vehicle from a data logger, you can convert it here to see how many 'g' forces the car is generating during a launch.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
