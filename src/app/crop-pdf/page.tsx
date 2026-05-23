import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scissors, ShieldCheck, Zap, HelpCircle, Scaling, MousePointer2, FileDigit, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfCropper from '@/components/pdf-cropper';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Precise PDF Cropper - Crop PDF Page Margins & Areas Online Privately',
  description: 'Select specific areas on your PDF pages and crop them into new documents. Perfect for extracting charts, tables, or removing white margins locally.',
};

export default function CropPdfPage() {
  const steps = [
    "Upload PDF: Select a document from your device.",
    "Select Page: Use the navigation arrows to find the page you want to crop.",
    "Draw Crop Area: Click and drag on the page to select the exact area to keep.",
    "Apply: Click 'Crop Page' to generate the new document in browser RAM.",
    "Download: Save your cropped PDF instantly with zero data risk."
  ];

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
            <PdfCropper />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="Professional PDF Cropper" steps={steps} />

            {/* AdSense Deep Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Scissors className="text-primary size-8" />
                        Precise Document Trimming
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard PDF readers don't let you extract small parts of a page. Our <strong>PDF Crop Tool</strong> uses a high-density viewport scale to let you zoom into charts, diagrams, or signatures and save them as independent high-quality PDF files.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Scaling className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Exact Aspect</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Free-form selection handles allow you to crop according to your content's exact dimensions.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <MousePointer2 className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Visual Select</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">See what you are cropping in real-time. No more guessing X/Y coordinates in complicated forms.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Cropping happens 100% locally on your computer. Your sensitive docs never touch our servers.</p>
                    </div>
                </div>
            </section>

            {/* Technical Detail */}
            <section className="bg-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FileDigit className="size-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Lossless Extraction Logic</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            Unlike basic screenshot tools, our <strong>PDF Cropper</strong> maps the coordinates of your selection directly to the internal PDF media box. This means we preserve the original vector data and text of the PDF, ensuring that your cropped document remains searchable and high-resolution for printing.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Cropping FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does cropping change the file size?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! By removing unwanted margins and white space, you can significantly reduce the physical and digital size of your document, making it easier to attach to emails or portals.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I crop all pages at once?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Currently, our tool allows you to crop one page at a time with extreme precision. This is ideal for extracting specific tables or headers that vary from page to page.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for bank statements?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This is the safest way to crop sensitive documents. Because we use **Client-Side JavaScript**, your files never leave your device. All processing happens in temporary memory (RAM).
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
