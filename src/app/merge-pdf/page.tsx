import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, SortAsc, ArrowUpDown, CheckCircle2, UploadCloud, Layers, Monitor, Download, Zap, X, ChevronDown, FileText } from 'lucide-react';
import PdfMerger from '@/components/pdf-merger';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Merge PDF Online - Combine Multiple PDFs into One File Privately',
  description: 'Merge and combine hundreds of PDF documents into a single secure file instantly. Drag and drop to reorder. 100% private local processing with zero server uploads.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/merge-pdf' },
  keywords: 'merge pdf online, combine pdf files, combine multiple pdfs into one, private pdf merger, local pdf joiner'
};

export default function MergePdfPage() {
  const deepSteps = [
    {
      title: "Batch Import",
      description: "Upload multiple PDF documents. Our engine initializes a safe buffer stack in your device RAM, mapping the pages without any server communication.",
      icon: "UploadCloud"
    },
    {
      title: "Stack Sequence",
      description: "Drag and drop files to change order, or use the 'Sort A-Z' tool. Precise ordering is critical for legal and academic bundles.",
      icon: "Layers"
    },
    {
      title: "Visual Audit",
      description: "Click 'Merge Pdfs'. Once combined, our built-in viewer renders the first 10 pages instantly so you can audit the sequence before saving.",
      icon: "Monitor"
    },
    {
      title: "WASM Export",
      description: "The engine bundles the final document using WebAssembly logic. Save your combined PDF. Zero quality loss and 100% data privacy.",
      icon: "Download"
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GR7 Pro PDF Merger",
    "applicationCategory": "PDFApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Industrial-grade local PDF merging tool with reordering and sorting capabilities."
  };

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20 text-left">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Bulk PDF Merger
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Combine hundreds of PDF documents into a single secure file instantly. 100% Private local processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PdfMerger />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Bulk PDF Merger" steps={deepSteps} />

            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white leading-none">
                        <CheckCircle2 className="text-primary size-8" />
                        Professional Document <br className="hidden md:block" /> Bundling
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Managing multiple PDFs for a single application is a hassle. Our <strong>Pro PDF Merger</strong> allows you to bundle dozens of documents with professional-grade control and zero privacy risk.
                    </p>
                </div>
                
                <div className="relative">
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner text-cyan-600">
                                    <SortAsc className="size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">BULK SORTING</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Auto-sort your files alphabetically or by numerical order with a single click. No more manual dragging for large bundles.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner text-indigo-600">
                                    <ArrowUpDown className="size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">ORDER CONTROL</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Full control over the sequence. Move any file to the top or bottom of the list instantly for perfect organization.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner text-purple-600">
                                    <ShieldCheck className="size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">SECURITY FIRST</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Combining files happens entirely in browser RAM. Your private documents never touch our server, ensuring total confidentiality.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Merging FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="faq-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How many PDFs can I merge at once?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            You can upload up to **50-100 PDF files** depending on your device's memory. Since the merge happens locally, there are no "server timeouts" or "upload limits."
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the quality of my PDF decrease?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            No. Our tool uses direct **byte-stream concatenation**. We copy the internal objects of your PDFs without re-compressing them, ensuring your text and images stay crystal clear.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I merge password-protected PDFs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            You must first unlock any password-protected files using our **"Unlock PDF"** tool. Once the document is unprotected, you can upload it here for merging.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
