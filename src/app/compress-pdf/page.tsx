import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Target, TrendingDown, Zap } from 'lucide-react';
import PdfCompressor from '@/components/pdf-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'PDF Compress - Shrink PDF to 100kb, 200kb & 500kb Online (Lossless)',
  description: 'Reduce PDF file size without losing text clarity. Features targeted optimization for SSC, UPSC, and Bank portals. 100% secure local browser-based compression.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/compress-pdf' }
};

export default function CompressPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Zap className="size-2.5" /> OPTIMIZATION STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">
                    PDF <span className="text-gradient-hero">Compressor</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Shrink PDF to 100KB, 200KB or 500KB while maintaining crisp text quality. 100% private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PdfCompressor />
            </div>
        </div>

        <div className="w-full max-w-[1600px] mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="Pro PDF Optimizer" steps={[
                "Upload PDF: Drag and drop any large document into the compressor workspace.",
                "Target Size: Select 'Target Size' and enter 100KB or 200KB for government forms.",
                "Process: Our engine intelligently iterates to hit the target with max quality.",
                "Download: Save your optimized PDF file locally with zero data risk."
            ]} />

            {/* Infographic Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Size Management
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Uploading massive documents to job portals or emails is frustrating. Our <strong>Ultra PDF Optimizer</strong> uses advanced sub-sampling to shrink files up to 90% while maintaining crisp text.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-cyan-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <Target className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">TARGET HITS</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Our smart engine automatically calculates the best quality-to-size ratio to hit your target strictly.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">LOCAL PRIVACY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your bank statements and ID cards never leave your device. Compression happens 100% in your browser RAM.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">NATIVE SPEED</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Using WASM technology, we process files at hardware speed. No queues, no limits, no "cloud" delays.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Compression FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about shrinking documents.</p>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will the text become blurry after compression?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            No. Our "Clean-Text Engine" uses adaptive rendering. We heavily compress large images within the PDF while applying a "High-Pass" filter to text areas to ensure fonts remain crisp and readable even at 100KB sizes.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">How do I compress for SSC or UPSC portals?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Most government portals ask for PDFs under **100KB or 200KB**. Use our "Target Size" mode, enter the limit (e.g., 100), and upload your file. The tool will automatically find the best settings to stay under that limit.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe for Bank Statements?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. Unlike other "Online Compressors" that store your data to train AI models, **GR7 Tools** processes everything locally. Your private financial data never touches a server.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Does it work with encrypted PDFs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            If the PDF is password-protected, you must first use our **"Unlock PDF"** tool. Once the document is open, you can upload it here for optimization.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
