
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap, HelpCircle, Info, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageCompressor from '@/components/image-compressor';
import { HowToGuide } from '@/components/how-to-guide';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'AI Image Compressor - Reduce JPG/PNG to 20kb, 50kb, 100kb Online',
  description: 'Pro image compression for SSC, UPSC, and IBPS forms. Reduce file size instantly without quality loss. 100% private local browser processing.',
};

export default function ImageCompressPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl mb-6 self-start">
            <Button asChild variant="outline" className="dark:border-white border-foreground/20 transition-all hover:shadow-lg hover:shadow-primary/30">
                <Link href="/tools?tab=image">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Image Tools
                </Link>
            </Button>
        </div>
        
        <div className="w-full flex justify-center mb-12">
            <ImageCompressor />
        </div>

        <div className="w-full max-w-4xl space-y-16">
            {/* Guide Section */}
            <HowToGuide title="Image Compressor" steps={[
                "Upload Image: Drag and drop your JPG or PNG file.",
                "Target Size: Select 'Fixed KB Size' if you need an exact size for forms.",
                "Adjust Quality: Use the slider to balance size and clarity.",
                "Download: Save your optimized image locally in RAM."
            ]} />

            {/* Deep Content Section 1 */}
            <section className="grid md:grid-cols-2 gap-12 items-center py-10 border-t">
                <div className="space-y-6">
                    <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Target className="text-primary size-8" />
                        Why Use Our AI Compressor?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        Online job applications for <strong>SSC, UPSC, and IBPS</strong> often require photos under 50KB or 20KB. Standard editors make them blurry. Our local AI engine intelligently reduces the file size while keeping the facial features sharp.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-primary/10">
                            <ShieldCheck className="text-green-500 size-6" />
                            <div>
                                <h4 className="font-bold text-sm">100% Private</h4>
                                <p className="text-xs text-muted-foreground">Files never leave your PC. Processing happens in RAM.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-primary/10">
                            <Zap className="text-yellow-500 size-6" />
                            <div>
                                <h4 className="font-bold text-sm">Instant Processing</h4>
                                <p className="text-xs text-muted-foreground">No queues, no waiting. Native browser speed.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
                    <Image 
                        src={placeholderData.image_tools.url} 
                        alt="Image Compression Guide" 
                        fill 
                        className="object-cover"
                        data-ai-hint={placeholderData.image_tools.hint}
                    />
                </div>
            </section>

            {/* Detailed SEO Content Section */}
            <section className="space-y-8 py-10 border-t">
                <h2 className="text-3xl font-black uppercase tracking-tight text-center">Professional Tool Details</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <h3 className="font-black text-primary uppercase text-sm">Fixed KB Compression</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Unlike basic tools, we allow you to set a target size like "50KB". Our algorithm iterates through quality levels and scales to find the perfect fit without artifacts.</p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-black text-primary uppercase text-sm">Smart Resampling</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">We use Lanczos resampling for image scaling during compression, ensuring that text and fine lines stay readable even at small sizes.</p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-black text-primary uppercase text-sm">Format Support</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">Full support for JPEG, PNG, and WebP. Convert and compress at the same time to optimize for website loading speeds (LCP).</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section - CRITICAL FOR ADSENSE */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground">Everything you need to know about our local compression engine.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Is it safe to upload my personal photos here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes, it is 100% safe. Our tool uses <strong>Client-Side Processing</strong>. This means your images are never uploaded to any server. All the "work" happens inside your browser's memory.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Will I lose quality if I compress to 20KB?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            While extreme compression does affect quality, our AI engine prioritizes facial details and text clarity. It is specifically designed to meet the strict requirements of SSC, UPSC, and Bank application forms.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Which format is best for government forms?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Most government portals require <strong>JPEG/JPG</strong> format. Our tool defaults to JPEG with high-quality settings to ensure your form doesn't get rejected.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">How many images can I compress at once?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Since we process files in your RAM, there is no hard limit. However, for the best performance, we recommend processing 5-10 images at a time.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
