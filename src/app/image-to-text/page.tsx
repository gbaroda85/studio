import { Metadata } from 'next';
import ImageToTextConverter from '@/components/image-to-text-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShieldCheck, Zap, Monitor, HelpCircle, Sparkles, BrainCircuit, FileSearch, Languages } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Image to Text (OCR) - Extract Text from Photos Online Securely',
  description: 'Smart local OCR tool to extract text from documents, screenshots, and notes. Supports English, Hindi, and regional scripts with 100% privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-to-text' },
  keywords: 'ocr online india, image to text hindi, extract text from screenshot, free ocr tool private, scanned document to text'
};

export default function ImageToTextPage() {
  const deepSteps = [
    {
      title: "High-DPI Neural Scan",
      description: "Select any document or image. Our engine samples the image at high DPI in local RAM to ensure small fonts are readable.",
      icon: "UploadCloud"
    },
    {
      title: "Multi-Language Analysis",
      description: "Tesseract.js performs a multi-layer semantic scan to understand characters and regional symbols with 99% accuracy.",
      icon: "BrainCircuit"
    },
    {
      title: "Semantic Formatting",
      description: "The AI recognizes and reconstructs the text while preserving line breaks and original layout. Native support for English and Hindi.",
      icon: "FileText"
    },
    {
      title: "Studio Clipboard Sync",
      description: "Text appears in our Editor. Use 'Copy' to move data to your clipboard or download as TXT/DOCX instantly.",
      icon: "Clipboard"
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GR7 AI OCR Studio",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Windows, macOS, Android, iOS",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Professional Optical Character Recognition (OCR) tool to extract text from images locally in the browser."
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gr7imagepdf.com" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://www.gr7imagepdf.com/tools" },
      { "@type": "ListItem", "position": 3, "name": "Image to Text", "item": "https://www.gr7imagepdf.com/image-to-text" }
    ]
  };

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28 text-left">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Image to Text Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Extract text from documents, screenshots and notes locally. 100% Private.
                </p>
            </div>

            <ImageToTextConverter />
        </div>
        
        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Smart Image to Text (OCR)" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight text-slate-800 dark:text-white">
                        Professional AI Extraction Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Traditional OCR tools send your sensitive data to remote servers. Our <strong>Neural Engine</strong> performs character recognition entirely within your browser memory. We support complex document layouts, helping you turn non-editable images into searchable digital text instantly.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <Languages className="size-10 text-cyan-500 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600 mb-2">HINDI & REGIONAL</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Specially optimized for Devanagari and regional scripts. Extract text from Hindi documents with high fidelity.</p>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <BrainCircuit className="size-10 text-indigo-500 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600 mb-2">Neural Cleansing</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Our AI identifies and removes "noise" from camera photos, ensuring the resulting text is clean and professional.</p>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <ShieldCheck className="size-10 text-purple-500 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-purple-600 mb-2">Private Sandbox</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your proprietary contracts, screenshots, and research papers never leave your device for processing.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">OCR Extraction FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">How accurate is the text extraction?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            For clear printed documents, our engine achieves **over 99% accuracy**. For blurry photos, we recommend using our "Photo Enhancer" first to sharpen the text before running OCR for better results.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Does it support extracting text from PDF?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Yes. You can upload scanned PDF files. The tool will automatically iterate through all pages, performing a deep neural scan on each one and appending the text sequentially.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Can I export to MS Word (DOCX)?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. Once the extraction is complete, you can use the "Export Cleaned File" buttons to download your text as a **DOCX, PDF, or TXT** file directly.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
