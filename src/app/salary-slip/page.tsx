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
import { Banknote, ShieldCheck, HelpCircle, FileDigit, Smartphone, Zap, Sparkles, X, ChevronDown, Layout } from 'lucide-react';

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
            <div className="w-full text-center mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Salary Slip Generator
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-sm">
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
            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Modern Payroll Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Ditch complicated Excel sheets. Our <strong>Professional Payslip Engine</strong> produces corporate-grade documents in seconds.
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
                                    <Banknote className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">TAX COMPLIANT</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Automated slots for PF, Professional Tax, and TDS ensure your slips are legally compliant for loan and visa applications.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <FileDigit className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">HD PDF RENDER</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Every document is rendered at high resolution, ensuring crisp text even after compression for email attachments.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO DATA LOG</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">We respect employee confidentiality. No salary data, names, or bank details are ever sent to our servers.</p>
                            </div>
                        </div>
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
