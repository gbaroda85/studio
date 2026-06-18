import { Metadata } from 'next';
import SalarySlipGenerator from '@/components/salary-slip-generator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Banknote, ShieldCheck, HelpCircle, FileDigit, Smartphone, Zap, Sparkles, X, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Salary Slip Generator - Create Professional Pay Slips Online Free (A4 PDF)',
  description: 'Generate professional and high-fidelity employee salary slips instantly. Automated PF, PT, HRA, and TDS calculations. 100% private local processing for HR and startups.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/salary-slip' }
};

export default function SalarySlipPage() {
  const deepSteps = [
    {
      title: "Employer Branding",
      description: "Enter company name, address, and upload your official logo. Our studio ensures your branding is rendered in high-definition.",
      icon: "Building2"
    },
    {
      title: "Employee Profile",
      description: "Fill in employee details like Designation, DOJ, PAN, and Bank Account. Data stays 100% local in your browser RAM.",
      icon: "User2"
    },
    {
      title: "Salary Breakdown",
      description: "Input monthly Basic Pay, HRA, and Deductions. The engine automatically calculates the Net Salary and tax components.",
      icon: "Banknote"
    },
    {
      title: "A4 Pro Export",
      description: "Click 'Generate Salary Slip'. Our studio renders a clean corporate-standard A4 document at 300DPI, ready for distribution.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=calculator" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 no-print max-w-[1600px] mx-auto">
            {/* Professional Hero Section */}
            <div className="w-full max-w-5xl text-center mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                {/* PREMIUM CAPSULE HEADER */}
                <div className="inline-flex items-center p-1 md:p-1.5 pr-4 md:pr-6 rounded-full bg-[#e0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-500/20 shadow-sm mb-4 mx-auto group transition-all hover:scale-105">
                    <div className="size-7 md:size-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-lg shrink-0">
                        <X className="size-4 md:size-5 stroke-[4]" />
                    </div>
                    <span className="ml-3 font-black text-[10px] md:text-xs tracking-widest text-slate-800 dark:text-emerald-400 uppercase">
                        PAYROLL STUDIO
                    </span>
                    <div className="w-px h-4 bg-slate-300/60 dark:bg-emerald-500/20 mx-4" />
                    <ChevronDown className="size-4 text-slate-800 dark:text-emerald-400 opacity-50" />
                </div>

                {/* 3D TITLE BAR */}
                <div className="w-full max-w-4xl mx-auto p-1 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-200 dark:bg-slate-800 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,1)] mb-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] md:rounded-[3.3rem] py-4 md:py-6 px-10 flex items-center justify-center border border-white/40 dark:border-white/5 shadow-inner transition-all hover:scale-[1.01]">
                        <h1 className="text-xl md:text-3xl lg:text-5xl font-jakarta font-black tracking-tighter uppercase leading-none">
                            Salary Slip <span className="text-gradient-hero">Generator</span>
                        </h1>
                    </div>
                </div>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Create professional employee pay slips in seconds. Compliant, accurate, and 100% private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <SalarySlipGenerator />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="Salary Slip Generator" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Modern Payroll for Small Business
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Ditch complicated Excel sheets. Our <strong>Professional Payslip Studio</strong> uses high-fidelity canvas mapping to produce corporate-grade salary documents in under 60 seconds.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Banknote className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Tax Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Automated slots for PF, Professional Tax, and TDS ensure your slips are legally compliant for loan and visa applications.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <FileDigit className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">HD PDF Output</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Every document is rendered at 3x scale, ensuring crisp text even after compression for email attachments.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Server Log</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">We respect employee confidentiality. No salary data, names, or bank details are ever sent to our servers.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Payroll FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is this salary slip valid for bank loans?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Our layout follows standard corporate formats used by major companies. As long as the details entered are accurate and it carries your company's seal/signature, it is widely accepted by banks for verification.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I upload my own company logo?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. There is a dedicated **"Upload Company Logo"** button in the branding section. It supports PNG and JPG formats and places your logo in the top right header for a professional look.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Are the calculations automated?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. The tool automatically sums up your **Earnings** and **Deductions**, and provides the final **Net Salary** (Take-home) in real-time as you type the numbers.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
