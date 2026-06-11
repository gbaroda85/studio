import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Code2, Globe, Braces, FileCode, Monitor, Sparkles, Download } from 'lucide-react';
import HtmlToPdfConverter from '@/components/html-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'HTML to PDF Converter - Convert Web Code to Professional Document Online',
  description: 'Convert raw HTML/CSS code into professional PDF documents instantly. 100% private local processing for developers and designers with live preview.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/html-to-pdf' }
};

export default function HtmlToPdfPage() {
  const deepSteps = [
    {
      title: "Input Code Source",
      description: "Paste your raw HTML5 and CSS3 code into the built-in Sandbox Editor. Our engine handles inline styles and internal <style> blocks with 100% fidelity.",
      icon: "FileCode"
    },
    {
      title: "Internal Rendering",
      description: "Our local engine constructs a virtual DOM in a safe sandbox. It interprets layout rules, flexbox, and grid systems to prepare the document for high-res capture.",
      icon: "Monitor"
    },
    {
      title: "High DPI Sampling",
      description: "The visual render is sampled at 2.5x scale, creating a crisp 300 DPI equivalent document. This ensures that web fonts and small text remain razor-sharp in the PDF.",
      icon: "Sparkles"
    },
    {
      title: "Standard A4 Export",
      description: "The rendered canvas is mapped to a standard A4 PDF container. Click 'Download' to get your professional document, ready for official use or printing.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full min-h-screen pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-0 md:px-8">
            <HtmlToPdfConverter />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 md:px-8 pb-24">
            <HowToGuide title="HTML to PDF HD Studio" steps={deepSteps} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Code2 className="text-primary size-8" />
                        Developer-First Rendering
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard converters often break CSS layouts. Our <strong>HTML-to-PDF Studio</strong> uses a high-precision canvas rendering engine that interprets modern HTML5 and CSS3 to produce documents that look exactly like your code.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Braces className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">CSS Master Support</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Full support for custom fonts, complex layouts, and modern CSS3 properties directly within your sandbox environment.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Globe className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Pixel-Perfect Logic</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Uses client-side rendering to turn DOM elements into high-resolution bitmap data before re-encoding them into a vector-ready PDF.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-green-500/50 transition-all">
                        <ShieldCheck className="text-green-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Secure RAM</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your proprietary code and resulting document stay 100% in your browser memory. No server ever sees your source code.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t pb-24">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">HTML Converter FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use external images in my HTML?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, but only if the image host supports **CORS (Cross-Origin Resource Sharing)**. For guaranteed results with local rendering, we recommend using base64 encoded images directly in your source code.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it support JavaScript execution?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. To ensure 100% privacy and prevent malicious execution, our studio only renders static HTML5 and CSS3. If you have dynamic content, render the final HTML in your environment first, then paste it here.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why use this instead of "Print to PDF"?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Standard browser printing often adds unwanted headers/footers like URLs and timestamps. Our **Studio Engine** generates a clean, document-grade PDF without any browser-specific artifacts.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
