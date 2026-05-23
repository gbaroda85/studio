import { Metadata } from 'next';
import { ArrowLeft, Merge, ShieldCheck, Zap, HelpCircle, SortAsc, FileStack, ArrowUpDown, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PdfMerger from '@/components/pdf-merger';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Bulk PDF Merger - Combine Multiple PDFs into One Online Privately',
  description: 'Combine hundreds of PDF documents into a single secure file. Features bulk upload, A-Z sorting, and re-ordering controls. 100% private local processing.',
};

export default function MergePdfPage() {
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
            <PdfMerger />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="Bulk PDF Merger" steps={[
                "Upload: Select two or more PDF files from your device.",
                "Organize: Use arrow buttons to move files up/down or use 'Sort A-Z'.",
                "Review: Ensure the order matches your desired final document.",
                "Merge: Click 'Merge PDFs' to bundle them together instantly.",
                "Preview: Use the built-in viewer to verify the result before downloading."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <FileStack className="text-primary size-8" />
                        Professional Document Bundling
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Managing multiple PDFs for a single application is a hassle. Our <strong>Pro PDF Merger</strong> allows you to bundle dozens of documents into a single, cohesive file with professional-grade sequence control.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <SortAsc className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Bulk Sorting</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Auto-sort your files alphabetically or by numerical order with a single click. No more manual dragging.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <ArrowUpDown className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Order Control</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Full control over the sequence. Move any file to the top or bottom of the list instantly.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Security First</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Combining files happens entirely in browser RAM. Your private data never touches our server.</p>
                    </div>
                </div>
            </section>

            {/* Feature Deep Dive */}
            <section className="bg-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-primary/20">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="size-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Integrated Live Preview</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            Unlike basic tools that force you to download and check, our <strong>PDF Merger</strong> features an integrated previewer. Once the merging process completes, a high-fidelity rendering of your new document appears instantly. This allows you to verify that pages are in the correct order and everything looks perfect before saving it to your device.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">PDF Merger FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about combining documents.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is there a limit on how many PDFs I can merge?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Technically no, but very large merges (50+ files) depend on your device's RAM. Most modern PCs and smartphones can easily merge hundreds of pages at once without any issues.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the final PDF file size be huge?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Our merger preserves the internal resources of your PDFs efficiently. If you find the final file is too big for your application, use our **"PDF Optimizer"** tool after merging to shrink it down to 100KB or 200KB.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I merge protected PDFs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. For security reasons, you must first remove the passwords using our **"Unlock PDF"** tool. Once the documents are open and accessible, you can upload them here for merging.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for legal contracts and bank statements?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This is the safest method available online. Because we use **Client-Side JavaScript**, your files never leave your device. The merging happens in temporary memory (RAM) and is deleted once you close the tab.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
