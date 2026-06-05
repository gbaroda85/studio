
import { Metadata } from 'next';
import { PenLine, ShieldCheck, Zap, HelpCircle, FileType, SearchCheck, Eraser, UploadCloud, Download, Eye, ArrowLeftRight } from 'lucide-react';
import SignatureRemover from '@/components/signature-remover';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <SignatureRemover />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Signature Background Remover" steps={deepSteps} />

            {/* AdSense Value Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Digitize Your Hand-written Signature</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">In the era of digital documents, having a clean signature file is essential. Our <strong>Smart Signature BG Remover</strong> doesn't just crop your photo; it performs pixel-level background subtraction to give you a professional transparent PNG.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <SearchCheck className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Shadow Removal</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Automatically eliminates shadows caused by camera flash or poor lighting, leaving only the ink behind.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <FileType className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Transparent PNG</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Exports with an alpha channel so you can overlay your signature on any PDF, Word doc, or Application form.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Secure Data</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your signature is your most sensitive data. We process it locally in RAM so it's never stored on our cloud.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Signature Tool FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the best way to take a signature photo?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Use a **dark black or blue pen** on a clean **plain white paper**. Avoid using ruled (lined) paper. Take the photo in bright, natural light without flash to minimize harsh shadows.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why is my signature looking "grainy"?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            If the photo is too dark or grainy, try increasing the **"Ink Darkness"** slider. This will boost the contrast of the extracted lines. If there is still "noise", increase the **"Sensitivity"** slider.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is this valid for IBPS or SSC bank forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! After extracting the signature here, you can use our **"Image Resize"** tool to set it to the exact 140x60px required by IBPS and SSC portals.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
