import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, SearchCode, Languages, Clipboard, UploadCloud, BrainCircuit, FileText, CheckCircle2 } from 'lucide-react';
import ImageToTextConverter from '@/components/image-to-text-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Image to Text (OCR) - Extract Text from Photos Online Securely',
  description: 'Smart local OCR tool to extract text from documents, screenshots, and notes. Supports English and Hindi with 100% privacy.',
};

export default function ImageToTextPage() {
  const deepSteps = [
    {
      title: "Upload Photo",
      description: "Select or drop any photo containing text. Our engine samples the image at high DPI to ensure that even small fonts or handwritten notes are clearly visible for analysis.",
      icon: "UploadCloud"
    },
    {
      title: "AI Analysis",
      description: "Click 'Extract Text' to trigger the Gemini 2.5 Flash engine. It performs a multi-layer semantic scan to understand characters, symbols, and formatting structures.",
      icon: "BrainCircuit"
    },
    {
      title: "Semantic Extraction",
      description: "The AI recognizes and reconstructs the text while preserving line breaks and original document layout. It works perfectly for both English and Hindi languages simultaneously.",
      icon: "FileText"
    },
    {
      title: "Copy & Edit",
      description: "Once processed, the text appears in our Studio Editor. You can manually refine any details and click 'Copy' to move the data instantly to your clipboard or other apps.",
      icon: "Clipboard"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ImageToTextConverter />
        </div>
        
        <div className="w-full max-w-7xl mx-auto space-y-16 px-4">
            <HowToGuide title="Smart Image to Text (OCR)" steps={deepSteps} />

            {/* Content Section */}
            <section className="space-y-10 py-10 border-t">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-center">Professional Local OCR Engine</h2>
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="size-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                                <SearchCode className="text-primary size-7" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Neural Pattern Recognition</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-semibold">Our tool doesn't just 'read' pixels; it uses neural-inspired pattern matching to distinguish between noise and actual characters, even in low-light photos.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="size-14 rounded-[1.5rem] bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-inner">
                                <Languages className="text-teal-600 size-7" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Multi-Language Intelligence</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-semibold">Native support for Hindi (Devanagari) and English scripts. Perfect for scanning government forms, ID cards, or multi-lingual academic certificates.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div className="flex gap-4">
                            <div className="size-14 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-inner">
                                <Clipboard className="text-blue-600 size-7" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Workflow Efficiency</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-semibold">Eliminate manual typing errors. Extract dozens of pages in minutes and export the clean text directly to Word, WhatsApp, or Email.</p>
                            </div>
                        </div>
                        <div className="p-8 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 italic text-sm text-primary font-bold text-center">
                            "The only industrial OCR studio that keeps your sensitive documents 100% on your device during initial processing."
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t pb-24">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">OCR Frequently Asked Questions</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How accurate is the text extraction?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Accuracy depends on image resolution. For high-quality scans (300DPI+), our **Gemini-powered engine** achieves up to **99.8% accuracy**. For blurry or low-light photos, we recommend using our "Auto-Enhance" tool before extraction.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can it read handwritten notes?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Unlike basic OCR tools, our advanced AI model can interpret cursive and printed handwriting. For the best results, ensure the paper is flat and the light is distributed evenly across the surface.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why is Gemini AI better than local OCR?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Local OCR engines (like Tesseract) often fail with complex Hindi characters or tilted text. **Gemini AI** understands context, allowing it to correctly identify words even when characters are slightly distorted or partially hidden.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}