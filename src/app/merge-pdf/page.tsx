import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, SortAsc, ArrowUpDown, CheckCircle2, LayoutGrid, Monitor, Download, Zap, Merge, FileDigit } from 'lucide-react';
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
  description: 'Merge and combine hundreds of PDF documents into a single secure file instantly. Drag and drop to reorder. 100% private local processing for bank statements and study materials.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/merge-pdf' },
  keywords: 'merge pdf online, combine pdf files, combine multiple pdfs into one, private pdf merger, local pdf joiner'
};

export default function MergePdfPage() {
  const deepSteps = [
    {
      title: "Batch Stream Import",
      description: "Upload multiple PDF documents. Our engine initializes a safe buffer stack in your device RAM, mapping pages without cloud latency.",
      icon: "UploadCloud"
    },
    {
      title: "Sequence Synchronization",
      description: "Drag and drop files to change order, or use the 'Sort A-Z' tool. Precise ordering is critical for legal and academic bundles.",
      icon: "Layers"
    },
    {
      title: "HD Visual Audit",
      description: "Click 'Merge Pdfs'. Once combined, our built-in viewer renders the first 10 pages instantly so you can verify the sequence.",
      icon: "Monitor"
    },
    {
      title: "Lossless Export",
      description: "The engine bundles the final document using WebAssembly logic. Save your combined PDF with 0% quality loss and 100% privacy.",
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
    "description": "Industrial-grade local PDF merging tool with reordering and alphabetical sorting capabilities."
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gr7imagepdf.com" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://www.gr7imagepdf.com/tools" },
      { "@type": "ListItem", "position": 3, "name": "Merge PDF", "item": "https://www.gr7imagepdf.com/merge-pdf" }
    ]
  };

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28 text-left">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        
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
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-800 dark:text-white leading-none">
                        Professional Document Bundling
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Managing multiple PDFs for a single application is a hassle. Our <strong>Pro PDF Merger</strong> allows you to bundle dozens of documents with professional-grade control. We support massive file stacks for bank statements, academic records, and legal e-filing.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <SortAsc className="size-10 text-cyan-600 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600 mb-2">Bulk Alpha Sort</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Auto-sort your files alphabetically or by numerical order with a single click. No more manual dragging.</p>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <ArrowUpDown className="size-10 text-indigo-600 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600 mb-2">Sequence Control</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Full control over the stack order. Move any file to the top or bottom of the list instantly.</p>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <ShieldCheck className="size-10 text-purple-600 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-purple-600 mb-2">Security Native</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Combining happens entirely in browser memory. Your private documents never touch our server.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">PDF Combining FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="faq-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is there a limit on how many PDFs I can merge?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Unlike online servers that limit you to 50MB, **GR7 Tools** depends on your device's RAM. You can merge 100+ pages or multiple files reaching 500MB+ easily on a modern PC or Smartphone.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will the text remain searchable after merging?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Yes. We use **Direct Byte-Stream Merging**. We don't "flatten" your PDFs into images; we copy the original internal vectors and text data, ensuring OCR and searchability remain intact.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for combining bank statements?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Absolutely. This is the **most secure** way to merge statements. Since no data is uploaded, your financial history stays strictly on your machine.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
