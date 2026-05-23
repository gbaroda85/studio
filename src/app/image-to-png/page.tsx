
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileOutput, ShieldCheck, Zap, HelpCircle, Layers, Image as ImageIcon, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageConverter from '@/components/image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Image to PNG Converter - Convert JPG, WEBP to Transparent PNG Online',
  description: 'Convert any image format to lossless PNG. Maintain transparency and crystal clear document quality with local browser processing. 100% private.',
};

export default function ImageToPngPage() {
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
            <ImageConverter targetFormat="png" />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="Image to PNG Converter" steps={[
                "Upload: Select a JPG, WEBP, or BMP file from your computer.",
                "Format: Make sure the output format is set to 'PNG'.",
                "Process: Click the conversion button to render pixels locally.",
                "Save: Download your high-clarity PNG file instantly."
            ]} />

            {/* AdSense SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Lossless Visual Preservation</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">PNG (Portable Network Graphics) is the gold standard for high-quality documents and digital assets. Unlike JPG, PNG uses <strong>Lossless Compression</strong>, meaning every single pixel is preserved exactly as it was in the original source.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Layers className="text-blue-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Transparency Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Perfect for converting signatures or logos that need to be overlaid on other documents or websites.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Zap className="text-yellow-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Zero Artifacts</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">No "noise" or "blur" around text. Ideal for screenshots, diagrams, and scanned certificates.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-teal-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">100% Private</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your data never leaves your device. Processing happens entirely in your browser's temporary memory.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image to PNG FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">When should I use PNG instead of JPG?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Use PNG when you need <strong>Transparency</strong> (like a logo without a background) or when you have images with <strong>Text</strong> (like a screenshot). JPG often blurs the edges of letters, while PNG keeps them sharp.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can I convert a JPG with a white background to a transparent PNG?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Converting a file to PNG format alone won't remove the background. To remove the white background and make it transparent, please use our <strong>"AI Background Remover"</strong> or <strong>"Signature Remover"</strong> tool.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why is the PNG file size larger than my original JPG?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            PNG is a lossless format, meaning it stores every bit of data to maintain 100% quality. JPG uses lossy compression to throw away data and save space. When you convert JPG to PNG, you are stopping further quality loss, but the file size will naturally be larger.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
