import { Metadata } from 'next';
import { Heart, Sparkles, ShieldCheck, HelpCircle, FileText, Palette, Type, Eye, Download } from 'lucide-react';
import MarriageBiodataGenerator from '@/components/marriage-biodata-generator';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Marriage Bio Data Generator - Create Premium Biodata Online Free (A4 PDF)',
  description: 'Create professional and traditional marriage biodata instantly. Features split-screen editor, photo upload, astrological info, and high-quality A4 PDF export. 100% private.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/marriage-biodata' }
};

export default function MarriageBiodataPage() {
  const deepSteps = [
    {
      title: "Studio Setup",
      description: "Choose a premium template (Royal Gold, Canva Pro) and set your theme color. Upload a clear portrait photo and optional God Logo (PNG) for a professional look.",
      icon: "Palette"
    },
    {
      title: "Identity Entry",
      description: "Fill in personal, career, and family details. Our smart forms handle everything from DOB/Time to Gotra and annual income with real-time sync.",
      icon: "Type"
    },
    {
      title: "Visual Alignment",
      description: "Our engine automatically arranges the data onto a standard A4 canvas. You can see the live preview on the right to ensure perfect spacing and alignment.",
      icon: "Eye"
    },
    {
      title: "Industrial Export",
      description: "Click 'Export to PDF'. The engine renders the document at 300DPI, ensuring ultra-sharp text and photos for physical printing and WhatsApp sharing.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-12 space-y-4">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Marriage Bio Data Maker
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-sm md:text-base">
                    Design a professional biodata in minutes with our real-time A4 studio. No more manual typing or formatting issues.
                </p>
            </div>
            
            <div className="w-full flex justify-center">
                <MarriageBiodataGenerator />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Marriage Biodata Maker" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Sparkles className="text-primary size-8" />
                        Professional Marriage Studio
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        First impressions matter. Our <strong>Professional Biodata Studio</strong> ensures your profile looks balanced, elegant, and standard-ready for all family discussions.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-rose-500/50 transition-all">
                        <FileText className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">A4 Standard</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Generated PDFs follow strict A4 sizing rules, making them perfect for WhatsApp sharing or physical printing.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Sparkles className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Modern Templates</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Uses a balanced 'Modern-Traditional' design that appeals to both tech-savvy youth and traditional elders.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Secure</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">We respect your privacy. All data stays in your browser memory and is never uploaded to any server.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Biodata FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is my personal information stored on your server?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. **GR7 Tools** is a client-side utility. Everything you type, including your photo, is processed entirely in your device's RAM. We do not have a database for your personal biodata.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I add my own photo to the biodata?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! There is a dedicated **Photo Upload** section. The tool will automatically frame and center your photo inside the A4 template for a premium look.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it support regional language fonts?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Currently, the tool is optimized for **English (Global)**. However, since it is a browser tool, you can copy-paste text in any language, and if your system supports it, it will render in the preview.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
