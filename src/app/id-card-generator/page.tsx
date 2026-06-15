
import { Metadata } from 'next';
import IdCardGenerator from '@/components/id-card-generator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Scan,
  Maximize,
  Smartphone,
  HelpCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional ID Card Generator - Create Employee & Student IDs Online Free',
  description: 'Design and print professional ID cards for employees, students, and staff. Supports bulk generation via Excel, QR codes, barcodes, and HD A4 print layouts. 100% private.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/id-card-generator' }
};

export default function IdCardGeneratorPage() {
  const deepSteps = [
    {
      title: "Template Selection",
      description: "Choose from Corporate, School, or Security templates. Select between Horizontal or Vertical orientation for your CR80 PVC standard card.",
      icon: "Layers"
    },
    {
      title: "Data Entry & Photo",
      description: "Fill in personal details and upload a photo. Use the built-in cropper to align the face perfectly within the card frame.",
      icon: "UserCircle"
    },
    {
      title: "Identity Layer",
      description: "Add automated QR codes and barcodes for security tracking. Upload authorized signatures and organization seals for a professional look.",
      icon: "Scan"
    },
    {
      title: "Bulk Import (Optional)",
      description: "Upload an Excel/CSV file to generate hundreds of cards instantly. Our engine maps headers to card fields automatically in your browser RAM.",
      icon: "FileSpreadsheet"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> CARD ISSUANCE STUDIO
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                    Smart ID <span className="text-gradient-hero">Generator Pro</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Create professional Employee, Student & Staff ID cards. Bulk Excel support, HD printing, and 100% private local processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <IdCardGenerator />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="ID Card Generator" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Enterprise Grade ID Card Issuance
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Stop paying for expensive ID card software. Our <strong>Professional Card Studio</strong> provides industrial-grade design tools directly in your browser. From single employee badges to bulk school IDs, we handle it all with 300DPI precision.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <FileSpreadsheet className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Excel Bulk Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Need 500 cards? Upload your employee list in Excel format and generate the entire batch in seconds locally.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Printer className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">A4 Auto-Layout</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Print 8 or 10 cards on a single A4 sheet with perfect alignment and cut marks for professional cutting.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Local Security</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">We never store your sensitive staff data or photos. Everything is processed in your device memory and wiped on tab close.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">ID Card FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is the output size compatible with PVC card printers?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. We use the **CR80 standard** (85.60mm × 53.98mm), which is the standard size for credit cards and PVC ID cards. The 300DPI export ensures that your specialized ID card printer produces sharp results.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I generate cards for a whole class at once?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Use the **"Bulk Import"** feature. Download our sample CSV/Excel template, fill in your student or employee names and details, and upload it. The tool will auto-generate a card for every row in the file.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I add my own organization logo and signatures?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. There are dedicated sections to upload your **Company Logo**, **Authorized Signatures**, and even an **Official Seal**. These stay local in your browser and are merged into the final render.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
