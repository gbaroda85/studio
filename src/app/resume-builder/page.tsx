
import { Metadata } from 'next';
import ResumeBuilderMain from '@/components/resume-builder-main';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, ShieldCheck, Zap, Sparkles, Target, Award, Download, Layout, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Professional Resume Builder - Create ATS-Friendly CV Online India',
  description: 'Create a job-winning resume in minutes. 15+ premium templates for Freshers, Engineers, and Executives. 100% private local browser processing. No login required.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/resume-builder' }
};

export default function ResumeBuilderPage() {
  const steps = [
    {
        title: "Personal Identity",
        description: "Fill in your contact details and upload a professional photo. Our engine uses standard typography for maximum ATS readability.",
        icon: "User2"
    },
    {
        title: "Smart Content",
        description: "Use our built-in suggestions for career objectives and summaries tailored for the Indian job market (IT, Sales, Finance, etc.).",
        icon: "Sparkles"
    },
    {
        title: "Template Selection",
        description: "Switch between 15 premium templates instantly. All layouts are auto-calibrated for A4 size and professional printing.",
        icon: "Layout"
    },
    {
        title: "HD Studio Export",
        description: "Download your resume as a high-fidelity PDF or Image. Your data stays 100% private in your local browser memory.",
        icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left overflow-x-hidden">
        <ToolNavigation href="/tools" label="Back to Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm">
                    <Sparkles className="size-3 text-yellow-400 fill-yellow-400" /> PRO RESUME STUDIO
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Resume Builder
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base uppercase tracking-widest opacity-60">
                    Create ATS-friendly resumes for IT, Finance, and Government jobs. 100% Private.
                </p>
            </div>

            {/* MAIN TOOL COMPONENT */}
            <div className="w-full relative z-10">
                <ResumeBuilderMain />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 md:px-12 pb-24 relative z-0">
            <HowToGuide title="Professional Resume Builder" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Standard Recruitment Compliance
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Getting hired in top companies like <strong>TCS, Infosys, or HDFC</strong> requires an ATS-optimized resume. Our studio ensures your profile is scanned correctly by modern recruitment software.
                    </p>
                </div>
                
                <div className="relative">
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <Target className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">ATS OPTIMIZED</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Engineered with clean hierarchy and standard fonts to ensure your resume passes through automated recruitment filters.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Award className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">PRO SUGGESTIONS</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Built-in professional phrases and objectives for Indian job roles like B.Tech Freshers, CAs, and Sales Executives.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO SERVER RISK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Your career data is highly sensitive. We process everything in your local device RAM. We never see or store your resume.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Resume FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is this resume builder really free?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Yes, it is 100% free with **no hidden charges** or watermark. Unlike other sites that charge for downloading, we offer professional PDF export at zero cost.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will my resume be ATS-friendly?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. Our templates follow the strict standards required by **Applicant Tracking Systems (ATS)**. We avoid complex graphics or layouts that confuse scanning software, focusing instead on clean text hierarchy.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is my personal data safe?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            This is the safest resume builder on the internet. **GR7 Tools** processes all information locally in your browser's temporary memory. We do not have a server database and we never collect your personal career history.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
