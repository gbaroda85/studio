import { Metadata } from 'next';
import ImageCompressor from '@/components/image-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Scaling, Wand2, Layers, Target, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compress Image to 20kb, 50kb & 100kb Online - Bulk Image Optimizer',
  description: 'Reduce image file size strictly for SSC, UPSC, IBPS and Bank portals. Compress multiple JPG/PNG photos to exact KB size locally with 100% privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-compress' },
  keywords: 'compress image to 20kb, image compressor for ssc, upsc photo compressor, reduce jpg size online, bulk image optimizer'
};

export default function ImageCompressPage() {
  const deepSteps = [
    {
      title: "Parallel Batch Upload",
      description: "Upload up to 50 images. Our engine initializes a multi-threaded processing queue in your browser for hardware speed.",
      icon: "UploadCloud"
    },
    {
      title: "KB Target Calibration",
      description: "Choose 'Strict Limit' for govt forms (20KB/50KB). Our algorithm iterative loops through quality tiers to hit your target exactly.",
      icon: "Target"
    },
    {
      title: "Neural Pixel Scaling",
      description: "The engine intelligently balances JPEG sub-sampling with subtle pixel scaling to maintain facial clarity at tiny file sizes.",
      icon: "Zap"
    },
    {
      title: "Sanitized Archive Save",
      description: "Download individual files or get the entire batch in a secure ZIP archive instantly. All processing is 100% private in local RAM.",
      icon: "Download"
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GR7 Bulk Image Optimizer",
    "applicationCategory": "ImageApplication",
    "operatingSystem": "Web Browser",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "High-precision bulk image compression tool for government portal submissions like SSC and UPSC."
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gr7imagepdf.com" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://www.gr7imagepdf.com/tools" },
      { "@type": "ListItem", "position": 3, "name": "Image Compress", "item": "https://www.gr7imagepdf.com/image-compress" }
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
                        Bulk Image Optimizer
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Reduce file size strictly to 20KB, 50KB or 100KB for government forms. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ImageCompressor />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-24">
            <HowToGuide title="Bulk Image Optimizer" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-800 dark:text-white leading-none">
                        Industrial Grade Batch Optimization
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Uploading high-res photos to government portals like <strong>SSC (Staff Selection Commission)</strong> or <strong>UPSC</strong> can be difficult due to strict KB limits. Our optimizer uses local binary search algorithms to hit your target size (e.g. exactly 19.5KB for a 20KB limit) without server-side latency.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <Layers className="size-10 text-cyan-600 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600 mb-2">Batch Parallelism</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Queue up to 50 images. Our engine uses your device's multi-core CPU to process images simultaneously.</p>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <Target className="size-10 text-indigo-600 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600 mb-2">Fixed KB Accuracy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Specify 20KB or 50KB, and our smart loop will find the maximum quality that fits the threshold.</p>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <ShieldCheck className="size-10 text-purple-600 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-purple-600 mb-2">Local Sandbox</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Signatures and photos are your property. We process everything in RAM with no cloud footprint.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Compression FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="faq-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How to compress images for SSC/UPSC portals?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Select the **"Strict Limit"** mode, enter your required size (usually 20KB or 50KB), and upload your photos. Our tool automatically adjusts dimensions and quality to ensure the file is accepted by government portals.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will I lose face clarity after compression?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Our engine uses a multi-pass sub-sampling logic. It preserves facial features while aggressively compressing background data to hit your target KB size without making the image look "noisy" or blurry.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I compress multiple photos at once?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Yes. This is a **Bulk Optimizer**. You can upload multiple files, set a global KB limit, and then download all optimized images together in a single ZIP file.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
