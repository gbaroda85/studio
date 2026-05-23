
import { Metadata } from 'next';
import { ArrowLeft, FileCode, ShieldCheck, Zap, HelpCircle, Code2, Globe, Braces } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HtmlToPdfConverter from '@/components/html-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'HTML to PDF Converter - Convert Web Code to Professional Document Online',
  description: 'Convert raw HTML/CSS code into professional PDF documents instantly. 100% private local processing for developers and designers with live preview.',
};

export default function HtmlToPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=pdf">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to PDF Tools
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <HtmlToPdfConverter />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="HTML to PDF HD Converter" steps={[
                "Editor: Paste your raw HTML and CSS code into the editor box.",
                "Styles: Ensure all your CSS is included in <style> tags.",
                "Convert: Click 'Convert to PDF' to render the code locally.",
                "Live Preview: Check the generated document in the preview pane.",
                "Download: Save your professional PDF locally."
            ]} />

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
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">CSS Support</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Full support for custom styles, colors, and layout positioning directly within your code.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Globe className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Render Engine</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses client-side rendering to turn DOM elements into high-resolution bitmap data for the PDF.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-green-500/50 transition-all">
                        <ShieldCheck className="text-green-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">100% Secure</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your code and resulting PDF stay 100% in your browser RAM. No server-side processing.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">HTML Converter FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use external images in my HTML?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, but only if the image source supports **CORS (Cross-Origin Resource Sharing)**. For best results, use base64 encoded images directly in your code.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it support JavaScript execution?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. For security and reliability, our tool only renders static HTML and CSS. If you have dynamic content, generate the HTML first and then paste it here.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why use this instead of "Print to PDF"?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Our tool is a **clean sandbox**. Browsers often add footers (URL, Date) to printed PDFs. Our converter gives you a professional result without any browser-specific watermarks.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
