
import { Metadata } from 'next';
import { Percent, HelpCircle, ShieldCheck, GraduationCap, Coins, Trophy } from 'lucide-react';
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

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> RATIO STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Percentage <span className="text-gradient-hero">Calculator</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Quickly calculate percentages for marks, discounts, and financial ratios.
                </p>
            </div>
            
            <PercentageCalculator />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20">
            <HowToGuide title="Percentage Calculator" steps={[
                "Select Mode: Choose 'Simple', 'Part/Whole', 'Marks', or 'Ratio'.",
                "Input Data: Enter the numbers for your specific calculation.",
                "Calculate: Hit the button for an instant result.",
                "Reset: Use the clear button for a new fresh calculation."
            ]} />
        </div>
    </main>
  );
}
