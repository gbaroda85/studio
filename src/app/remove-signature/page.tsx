import { Metadata } from 'next';
import SignatureRemover from '@/components/signature-remover';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles, Eraser, ShieldCheck, Zap, PenLine, FileType, Target, HelpCircle, Monitor } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Signature Background Remover - Extract Clean PNG Signatures Online',
  description: 'Extract clean, transparent signatures from photos instantly. Remove paper backgrounds and shadows locally for digital signing. 100% private.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/remove-signature' }
};

export const dynamic = 'force-dynamic';

export default function RemoveSignaturePage() {
  const deepSteps = [
    {
      title: "Raw Photo Capture",
      description: "Take a clear photo of your signature on white paper. Our engine initializes a pixel-level histogram to prepare for background subtraction.",
      icon: "UploadCloud"
    },
    {
      title: "Chroma Extraction",
      description: "Click 'Start Cleaning'. The tool uses advanced color-distance algorithms to isolate ink from paper textures and uneven lighting.",
      icon: "Eraser"
    },
    {
      title: "Visual Fine-Tuning",
      description: "Use the 'Sensitivity' slider to remove stubborn shadows. Use 'Ink Darkness' to ensure the signature is bold and digital-ready.",
      icon: "ArrowLeftRight"
    },
    {
      title: "Transparent Save",
      description: "Click 'Download PNG'. Your signature is saved with a true alpha channel (Transparent), ready to be placed on any PDF or form.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Signature BG Remover
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Extract clean signatures from paper photos. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <SignatureRemover />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Signature Background Remover" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white text-center">
                        Signature Extraction Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium text-center">
                        Digitizing signatures often results in ugly grey boxes. Our <strong>Professional Extraction Studio</strong> isolates the raw ink, creating a true transparent PNG for professional e-signing.
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
                                    <Eraser className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">CHROMA SUBTRACTION</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Uses adaptive color-distance logic to strip paper textures and uneven shadows, leaving only the ink intact.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <FileType className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">ALPHA TRANSPARENCY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Generates a true transparent alpha-channel PNG, allowing your signature to blend seamlessly on any digital form.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">PRIVACY LOCK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Signatures are your legal identity. Our studio processes everything in local RAM, so your signature is never stored or seen.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Signature FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will it remove the grey shadows from my paper photo?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Yes! That is exactly what our <strong>"Sensitivity"</strong> slider does. It allows you to adjust the extraction threshold until the grey paper shadows disappear completely, leaving only a bold, clean signature.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Can I use the extracted PNG for e-signing PDFs?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. The resulting file is a <strong>transparent PNG</strong>. You can use our "PDF Editor" tool to upload this PNG and place it directly over any signature line in a document.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe to process my legal signature here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            We take your security very seriously. <strong>GR7 Tools</strong> performs all image manipulation on your own device. Your signature never travels to any server or cloud database.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
