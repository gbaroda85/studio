
import { Metadata } from 'next';
import { Waves, ShieldCheck, HelpCircle, Activity, MonitorCheck } from 'lucide-react';
import PressureConverter from '@/components/pressure-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Pressure Converter - Bar, PSI, Pa, ATM Units Online HD',
  description: 'Instant pressure unit conversion. Convert between Pascal, Bar, PSI, and Atmosphere units. Precise for industrial and automotive use.',
};

export default function PressureConverterPage() {
  const steps = [
    "Value: Enter the pressure numeric value.",
    "From Unit: Choose current unit (e.g., PSI for tyres).",
    "To Unit: Choose target unit (e.g., Bar).",
    "Result: View accurate conversion results instantly.",
    "Precision: All calculations use high-precision floating point math."
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PressureConverter />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Pressure Unit Converter" steps={steps} />

            {/* AdSense SEO Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Waves className="text-primary size-8" />
                        Industrial Pressure Calibration
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        From monitoring car tyre pressure (PSI) to industrial boiler safety (Bar), accurate pressure measurement is vital. Our <strong>Pressure Studio</strong> provides standardized conversions across metric and imperial systems with 100% privacy.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Activity className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Tyre & Auto</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Perfect for converting PSI to Bar for vehicle maintenance and understanding official manufacturer tire specs.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <MonitorCheck className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Scientific Pa</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Full support for Pascal (Pa) and Kilopascal (kPa) for laboratory research and engineering documentation.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Local Math</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All logic runs via JavaScript in your browser. No data is stored or sent to any cloud server for processing.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Pressure FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How many PSI is in 1 Bar?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            **1 Bar is equal to 14.5038 PSI** (Pounds per Square Inch). Bars are more common in European machinery and diving equipment, while PSI is the standard for most automotive tires and air compressors.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is 'Standard Atmosphere' (atm)?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            1 atm is the average air pressure at sea level on Earth. It is approximately **1.01325 Bar** or **14.696 PSI**. Scientists use this as a reference point for gas behavior and fluid dynamics.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why convert to Pascal (Pa)?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Pascal is the official SI unit for pressure. While 1 Pa is a very small amount (like the pressure of a piece of paper on a table), Kilopascals (kPa) are frequently used in scientific papers and weather reports for atmospheric pressure.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
