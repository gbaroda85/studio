
import { Metadata } from 'next';
import { Contact2, ShieldCheck, HelpCircle, FileText, Printer, Star } from 'lucide-react';
import ResumeBuilder from '@/components/resume-builder';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Pro Resume Builder - Create ATS-Ready Professional CV Online (A4 PDF)',
  description: 'Design a high-impact, modern resume with our professional CV builder. 100% private, local processing with strict A4 print-ready layout.',
};

export default function ResumeBuilderPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full">
        <ToolNavigation href="/tools?tab=file" label="Back to File Tools" className="no-print" />

        <div className="w-full flex flex-col items-center mb-12 px-4 no-print">
            <div className="w-full max-w-5xl text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Star className="size-3 fill-blue-600" /> PREMIUM CAREER STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Pro <span className="text-gradient-hero">Resume</span> Builder
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Create an ATS-optimized professional CV in minutes. High-contrast, clean visual hierarchy, and 100% print-ready.
                </p>
            </div>
            
            <div className="w-full flex justify-center">
                <ResumeBuilder />
            </div>
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="Professional Resume Builder" steps={[
                "Select Template: Pick from Elite, Classic, or Minimalist styles.",
                "Personal Info: Add your name, title, and professional contact links.",
                "Summary: Write an impactful professional bio focused on achievements.",
                "Experience: Detail your work history with clean bullets for ATS parsing.",
                "Skills: Templates will automatically visualize your expertise levels.",
                "Print: Click 'Print as Premium A4 PDF' to get your document."
            ]} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <FileText className="text-primary size-8" />
                        Professional Career Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Your CV is your first pitch. Our <strong>Professional Resume Studio</strong> ensures it follows a minimalist, modern standard that looks great on screen and even better on paper.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Contact2 className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">ATS-Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses semantic layouts that automated Applicant Tracking Systems can parse with 100% accuracy.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Printer className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Print Perfect</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Hard-coded A4 scaling and margin rules ensure your resume prints exactly as it appears in the studio.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your career details are sensitive. We process everything in your browser memory—no server uploads, ever.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Resume FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why should I use the Classic template?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The **Classic** template is best for academic roles or conservative industries (Law, Government) where a single-column, traditional serif font is expected.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I save it as a PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Click the **"Print"** button. In the print dialog, select **"Save as PDF"** as the destination. Our CSS automatically centers the resume on an A4 sheet for you.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for my private work history?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. **GR7 Tools** processes all data 100% locally in your RAM. Once you close the tab, your data is wiped.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>

        {/* HIDDEN PRINT COMPONENT FOR CTRL+P */}
        <div className="hidden print:block w-full">
            <ResumeBuilder isPrintMode={true} />
        </div>
    </main>
  );
}
