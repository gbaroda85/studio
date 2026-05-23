
import { Metadata } from 'next';
import { ArrowLeft, FileText, ShieldCheck, Zap, HelpCircle, Type, Layout, NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TextToPdfConverter from '@/components/text-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Text to PDF Converter - Create Clean PDF Documents from Plain Text Online',
  description: 'Convert plain text, notes, or code into professional PDF files. Customize fonts, sizes, and margins locally in your browser for 100% privacy.',
};

export default function TextToPdfPage() {
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
            <TextToPdfConverter />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="Professional Text to PDF" steps={[
                "Editor: Paste or type your content into the smart editor.",
                "Style: Select from professional fonts like Helvetica or Times New Roman.",
                "Layout: Adjust font size and page margins for the best readability.",
                "Convert: Our engine automatically handles line wrapping and page breaks.",
                "Download: Preview your document and save it locally."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Type className="text-primary size-8" />
                        Clean Document Creation
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Need to turn a quick note or simple text into an official PDF? Our <strong>Text-to-PDF Studio</strong> provides a clutter-free environment to format and digitize your thoughts with total privacy.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Layout className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Auto Pagination</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Don't worry about long text. Our engine automatically calculates page breaks and line heights.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <NotebookPen className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Pro Fonts</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Supports standard system fonts ensuring your PDF looks consistent on any device.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Privacy First</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your text is never sent to a server. The PDF generation happens 100% in your browser's RAM.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Text to PDF FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use this for programming code?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! We recommend using the **Courier** font for code, as it is a monospaced font where every character takes up the same width, making code easier to read.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I change the page size?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Our tool defaults to the standard **A4 Page Size** (210x297mm), which is the global standard for official documents and printing.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is there a word limit?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No hard word limit. However, for extremely long documents (100+ pages), the browser may take a few seconds to calculate the layout before the preview appears.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
