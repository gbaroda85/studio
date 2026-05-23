import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Maximize, Target, ShieldCheck, HelpCircle, User, PenTool, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageResizer from '@/components/image-resizer';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Smart Image Resizer - Resize for SSC, UPSC, IBPS Application Forms Online',
  description: 'Exact pixel and mm resizing for government job forms. Resize photos to 200x230px and signatures to 140x60px instantly and privately in your browser.',
};

export default function ImageResizePage() {
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
            <ImageResizer />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="Professional Image Resizer" steps={[
                "Upload Image: Select the photo or signature you want to resize.",
                "Select Mode: Use 'Govt Job Presets' or enter custom Pixel/MM values.",
                "Lock Ratio: Keep 'Maintain Aspect Ratio' checked to avoid stretching.",
                "Format: Choose JPEG (for forms) or PNG/WebP.",
                "Download: Save your perfectly sized image locally."
            ]} />

            {/* In-depth Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">The Ultimate Form Ready Tool</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Resizing images for official portals like SSC, UPSC, or Bank forms can be tricky. Standard tools often blur the text or stretch the face. Our <strong>Smart Resizer</strong> is calibrated for official requirements.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <User className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Passport Photos</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">One-click presets for 200x230px (SSC) and other standard passport dimensions used in Indian exams.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <PenTool className="text-blue-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Signatures</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Convert scanned signatures to 140x60px instantly while maintaining high contrast for better legibility.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-teal-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">100% Privacy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Since the processing happens in your browser RAM, your sensitive documents never touch any server.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Resizer FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why does the portal say "Invalid Dimensions"?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Most government portals require exact Width x Height in pixels. Our presets like "SSC Photo" are hard-coded with the latest official requirements (200x230px) to ensure your form is never rejected.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can I resize in MM or CM?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes! Our tool supports PX, MM, and INCH units. If a form asks for 3.5cm x 4.5cm, you can simply switch the unit to MM and enter 35 and 45.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Will I lose image quality?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            We use Lanczos resampling logic which is a high-quality interpolation method. This ensures that even when you shrink an image, the edges stay sharp and text remains readable.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
