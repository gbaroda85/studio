import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Sun, Zap } from 'lucide-react';
import PhotoEnhancer from '@/components/photo-enhancer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'AI Photo Enhancer - Fix Blurry, Dark & Low-Quality Photos Online HD',
  description: 'Automatically improve photo quality, brightness, and sharpness using local AI. Professional enhancement with zero data risk. 100% private and free.',
};

export const dynamic = 'force-dynamic';

export default function EnhancePhotoPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <PhotoEnhancer />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="AI Photo Enhancer" steps={[
                "Upload: Choose a dark, blurry, or low-resolution photo.",
                "Auto-Enhance: One-click fix for brightness and color balance.",
                "Manual Refine: Fine-tune contrast and sharpness using precision sliders.",
                "Sharpness Boost: Apply neural edge sharpening to fix blur.",
                "Export: Save your HD result directly to your device."
            ]} />

            {/* AdSense SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Restore Your Precious Memories</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Old photos or low-light shots often lack the clarity needed for social media or printing. Our <strong>AI Photo Enhancer</strong> uses advanced convolution algorithms to restore details, balance exposure, and vividness instantly.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Sun className="text-orange-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Exposure Fix</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Intelligently brightens under-exposed areas without washing out colors, perfect for indoor selfies.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Zap className="text-yellow-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Edge Sharpening</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses a high-pass kernel filter to emphasize borders and textures, fixing minor camera shake blur.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-green-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Browser Native</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Processing is 100% on-device. Your personal memories are never sent to a cloud or seen by anyone.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Photo Enhancement FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can it fix very blurry photos?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            While it can significantly improve "soft" focus and minor lens blur, extremely blurred photos (where details are completely missing) are hard to fully restore. It works best for sharpening document text and light facial details.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">How does the "Auto-Enhance" work?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Auto-Enhance analyzes the histogram of your image and automatically adjusts the brightness, contrast, and saturation to match "Professional Grade" photography profiles.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Is there a limit on file size?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            We support high-resolution images up to 10MB. For larger photos, we recommend using our **"Image Compress"** tool first if your device has limited RAM.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
