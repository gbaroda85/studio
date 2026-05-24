
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, User, PenTool, Scaling, Layers, Maximize } from 'lucide-react';
import ImageResizer from '@/components/image-resizer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
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
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ImageResizer />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Professional Image Resizer" steps={[
                "Upload Image: Select the photo or signature you want to resize.",
                "Select Mode: Use 'Govt Job Presets' or enter custom Pixel/MM values.",
                "Lock Ratio: Keep 'Maintain Aspect Ratio' checked to avoid stretching.",
                "Format: Choose JPEG (for forms) or PNG/WebP.",
                "Download: Save your perfectly sized image locally."
            ]} [] />

            {/* In-depth Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Scaling className="text-primary size-8" />
                        Professional Grade Dimension Control
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Resizing images for official portals like <strong>SSC, UPSC, or Bank forms</strong> can be tricky. Standard tools often blur the text or stretch the face. Our <strong>Smart Resizer</strong> is calibrated for exact official requirements with zero data risk.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/40 transition-all">
                        <User className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Passport Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">One-click presets for 200x230px and other standard passport dimensions used in Indian competitive exams.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/40 transition-all">
                        <PenTool className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Signature Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Convert scanned signatures to 140x60px instantly while maintaining high contrast for better legibility on digital forms.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/40 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Local Privacy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Since processing happens in your browser RAM, your sensitive ID cards and personal documents never touch any server.</p>
                    </div>
                </div>
            </section>

            {/* Technical Detail Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase tracking-tight">The Precision Resampling Engine</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-muted/30 rounded-2xl">
                                <Layers className="text-primary size-6 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">Lanczos 3 Algorithm</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Unlike basic linear resizing, we use a high-order interpolation method that preserves sharp edges even when heavily shrinking a photo.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-muted/30 rounded-2xl">
                                <Maximize className="text-orange-500 size-6 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">MM/Inch to Pixel Math</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Need 3.5cm x 4.5cm? Our tool automatically calculates the exact pixel count based on standard DPI requirements for high-quality printing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Resizer Frequently Asked Questions</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about official document resizing.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why does the portal say "Invalid Dimensions" after resizing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Most government portals like SSC or IBPS require exact Width x Height in pixels. Our presets like "SSC Photo" are hard-coded with the latest official requirements (200x230px) to ensure your form is never rejected.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I resize in CM or Inches?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Our tool supports PX, MM, and INCH units. If a form asks for 3.5cm x 4.5cm, simply switch the unit to MM and enter 35 and 45. The tool handles the DPI conversion for you.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for upload my signature here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. We use <strong>Client-Side Processing</strong>. This means your images are never uploaded to any server. All the work happens inside your browser's temporary memory (RAM) and is deleted the moment you close the tab.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does the image get blurry when I shrink it?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            No. We use professional resampling kernels that maintain the sharpness of text and facial features even when reducing the dimensions significantly.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
