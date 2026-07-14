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
import { HelpCircle, Scaling, Wand2, Layers, Target, ShieldCheck, Zap, X, ChevronDown, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compress Image to 20kb, 50kb & 100kb Online - Bulk Image Optimizer',
  description: 'Reduce image file size strictly for SSC, UPSC, IBPS and Bank applications. Compress multiple JPG/PNG photos to exact KB size locally with 100% privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-compress' },
  keywords: 'compress image to 20kb, image compressor for ssc, upsc photo compressor, reduce jpg size online, bulk image optimizer'
};

export default function ImageCompressPage() {
  const deepSteps = [
    {
      title: "Batch Upload",
      description: "Upload up to 50 images. Our engine initializes parallel processing queue in your browser for industrial speed without server communication.",
      icon: "UploadCloud"
    },
    {
      title: "Set KB Target",
      description: "Choose 'Target Size' for govt forms (20KB/50KB). Our algorithm hits 90% of the limit for strict portal compliance.",
      icon: "Target"
    },
    {
      title: "Adaptive Scaling",
      description: "The engine intelligently balances JPEG sub-sampling with subtle pixel scaling to maintain face clarity at tiny file sizes.",
      icon: "Zap"
    },
    {
      title: "Secure ZIP Save",
      description: "Download individual files or get the entire batch in a secure ZIP archive instantly. All processing is 100% private in local RAM.",
      icon: "Download"
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GR7 Bulk Image Optimizer",
    "applicationCategory": "ImageApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "High-precision bulk image compression tool for government portal submissions."
  };

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28 text-left">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white text-center leading-none">
                        Professional Grade <br className="hidden md:block" /> Batch Optimization
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard online tools limit you to one photo at a time. Our <strong>Bulk Image Optimizer</strong> allows you to process entire batches for portals with 100% privacy and zero quality degradation.
                    </p>
                </div>
                
                <div className="relative">
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner text-cyan-600">
                                    <Layers className="size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">MULTI-THREADING</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Queue up to 50 images. Our engine uses your device's multi-core CPU to process images in parallel at native speed.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner text-indigo-600">
                                    <Target className="size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">FIXED KB PRECISION</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Specify 20KB, 50KB, or 100KB, and our smart algorithm will hit the target size with the maximum possible clarity.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner text-purple-600">
                                    <ShieldCheck className="size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">AIR-GAPPED PRIVACY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Zero server uploads. Your private documents are processed in your browser RAM and deleted immediately after use.</p>
                            </div>
                        </div>
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
                        <AccordionTrigger className="text-lg font-bold text-left">How do I compress images for SSC or UPSC?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Select the **"Strict Limit"** mode, enter your required size (usually 20KB or 50KB), and upload your photos. Our tool automatically adjusts dimensions and quality to ensure the file is accepted by government portals.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Will I lose photo quality?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Our engine uses a multi-pass sub-sampling logic. It preserves facial features and text while aggressively compressing background data to hit your target KB size without making the image look blurry.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe to upload my signature?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Absolutely. This is a **local-only tool**. Your photos and signatures never travel over the internet. Everything happens inside your browser's temporary memory (RAM).
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
