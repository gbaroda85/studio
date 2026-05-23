import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, PenLine, ShieldCheck, Zap, HelpCircle, FileType, SearchCheck, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignatureRemover from '@/components/signature-remover';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'AI Signature Extractor - Clean Signatures from Documents Online (Transparent PNG)',
  description: 'Extract clean, transparent signatures from document photos using local AI. Perfect for digital signing, PDFs, and official forms. 100% private and secure.',
};

export const dynamic = 'force-dynamic';

export default function RemoveSignaturePage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-stretch">
        <div className="mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Image Tools
                </Link>
            </Button>
        </div>

        <div className="w-full flex justify-center mb-12">
            <SignatureRemover />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="AI Signature Remover" steps={[
                "Upload Image: Take a clear photo of your signature on white paper.",
                "Extract: Click 'Start Cleaning' to let our AI isolate the ink.",
                "Adjust: Use 'Sensitivity' to remove paper shadows or gray spots.",
                "Boost Ink: Enhance the darkness of the signature if it's too light.",
                "Download: Save as a high-quality transparent PNG for digital docs."
            ]} />

            {/* AdSense Value Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Digitize Your Hand-written Signature</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">In the era of digital documents, having a clean signature file is essential. Our <strong>AI Signature Extractor</strong> doesn't just crop your photo; it performs pixel-level background subtraction to give you a professional transparent PNG.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <SearchCheck className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Shadow Removal</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Automatically eliminates shadows caused by camera flash or poor lighting, leaving only the ink behind.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <FileType className="text-blue-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Transparent PNG</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Exports with an alpha channel so you can overlay your signature on any PDF, Word doc, or Application form.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-teal-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Secure Data</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your signature is your most sensitive data. We process it locally in RAM so it's never stored on our cloud.</p>
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
                        <AccordionTrigger className="text-lg font-bold">What is the best way to take a signature photo?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Use a **dark black or blue pen** on a clean **plain white paper**. Avoid using ruled (lined) paper. Take the photo in bright, natural light without flash to minimize harsh shadows.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why is my signature looking "grainy"?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            If the photo is too dark or grainy, try increasing the **"Ink Darkness"** slider. This will boost the contrast of the extracted lines. If there is still "noise", increase the **"Sensitivity"** slider.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Is this valid for IBPS or SSC bank forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes! After extracting the signature here, you can use our **"Image Resize"** tool to set it to the exact 140x60px required by IBPS and SSC portals.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
