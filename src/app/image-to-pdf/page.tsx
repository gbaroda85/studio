
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileDigit, ShieldCheck, Zap, HelpCircle, Layers, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageToPdfConverter from '@/components/image-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Image to PDF Converter - Convert Multiple Photos to PDF Online Free',
  description: 'Easily combine JPG, PNG, and WEBP images into a single professional PDF document. 100% private, no server uploads, secure local conversion.',
};

export default function ImageToPdfPage() {
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
            <ImageToPdfConverter />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="Image to PDF Converter" steps={[
                "Upload Images: Select one or more image files. You can add more files to the list at any time.",
                "Review Order: The images will appear in the order they will be bundled in the PDF.",
                "Process: Click the 'CREATE PDF' button to generate the document locally in your RAM.",
                "Download: Save your combined PDF document to your device instantly."
            ]} />

            {/* AdSense SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Convert & Bundle Document Sets</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Whether you are scanning a multi-page homework assignment, a medical bill, or a collection of receipts for tax filing, our <strong>Image to PDF</strong> tool is designed for bulk efficiency. It bundles multiple files into a single, professional container instantly.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Layers className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Batch Processing</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Combine up to 50 photos into one secure document in a single click. Ideal for document digitizing.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Sparkles className="text-yellow-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">High Resolution</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our engine maintains the source image's DPI, ensuring text and signatures remain perfectly readable for printing.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-green-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Zero Server Risk</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your personal documents are converted locally in browser memory. No data is stored or seen by us.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image to PDF FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Which image formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            We support all major formats including <strong>JPG, JPEG, PNG, WEBP, and BMP</strong>. You can even mix different formats in a single PDF document.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Is there a limit on the number of pages?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            There is no hard coded limit. However, since the conversion happens in your device's RAM, adding too many high-resolution photos (more than 100) might slow down older mobile devices.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can I rearrange the page order?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Currently, the order is based on the selection order. If you want a specific order, we recommend clicking 'Clear All' and selecting images one by one in the sequence you desire.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
