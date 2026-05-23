import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileDigit, ShieldCheck, Zap, HelpCircle, Layers, Image as ImageIcon, Sparkles, Layout, MonitorCheck } from 'lucide-react';
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
  title: 'Image to PDF Converter - Convert Multiple Photos with Layout Control Online',
  description: 'Convert JPG, PNG, and WEBP to PDF with Top, Center, and Bottom alignment. Professional tool to bundle photos into a high-quality A4 PDF document instantly.',
};

export default function ImageToPdfPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mb-6 self-start">
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

        <div className="w-full max-w-4xl space-y-16">
            <HowToGuide title="Advanced Image to PDF Converter" steps={[
                "Upload Images: Select one or more image files from your device.",
                "Choose Layout: Use the sidebar to select alignment (Top, Center, Bottom).",
                "Scaling Mode: Select 'Fit to Page' or keep 'Original Size' for crisp quality.",
                "Preview: Click 'CREATE PDF' to see a live preview of your document.",
                "Download: Save your professional PDF locally with 100% privacy."
            ]} />

            {/* AdSense Ready Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Layout className="text-primary size-8" />
                        Professional Layout & Positioning
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard converters force stretch images, making small photos blurry. Our <strong>Image to PDF Pro</strong> gives you full control over vertical alignment and scaling, ensuring your digital documents look clean and professional.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <MonitorCheck className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Live Preview</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">See your document in a browser-native preview box before you download. No more guesswork or repeated downloads.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Layers className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">High-DPI Export</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our engine renders pages in high-definition (300 DPI equivalent) to ensure scanned text and signatures remain perfectly readable.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <ShieldCheck className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Client-Side</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">We respect your data. Every byte of the PDF is generated in your computer's RAM. No files ever leave your device.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image to PDF FAQs</h2>
                    <p className="text-muted-foreground font-medium">Common questions about local PDF generation.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why should I use "Original Size" mode?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            When you have small images (like a 200px signature), stretching them to fill an A4 page makes them very blurry. "Original Size" mode keeps them at their natural pixel resolution, making them look sharp on the PDF page.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I change the order of images?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Currently, the order is decided by the selection sequence. If you want a specific order, please select your images one by one or click "Clear All" to re-upload in the desired sequence.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We support all major formats including <strong>JPEG, PNG, WEBP, and BMP</strong>. You can even mix these formats in a single multi-page PDF document.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for personal ID cards?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes, it is the safest method available online. Because we use <strong>Client-Side JS</strong>, your sensitive ID photos are never uploaded to any server. The conversion happens 100% offline in your browser.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
