
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Target, Sparkles } from 'lucide-react';
import ImageConverter from '@/components/image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Image to JPG Converter - Convert PNG, WEBP, BMP to JPG Online HD',
  description: 'Convert any image format to standard high-quality JPG instantly. Best for passport photos, web uploads, and social media with 100% privacy.',
};

export default function ImageToJpgPage() {
  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ImageConverter targetFormat="jpeg" />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Image to JPG Converter" steps={[
                "Upload Photo: Select any image (PNG, WEBP, BMP) from your device.",
                "Verify Target: Ensure 'JPEG' is selected as the output format.",
                "Convert: Click 'START CONVERSION' to process the file locally in RAM.",
                "Download: Save your high-quality JPG result instantly."
            ]} />

            {/* AdSense SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">The Universal Image Standard</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">JPEG (JPG) is the most widely supported image format in the world. Whether you are uploading a photo for <strong>SSC, UPSC, or Banking forms</strong>, JPG is usually the required standard due to its balance of file size and clarity.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Target className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">Perfect for Portals</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Convert large PNG screenshots into standard JPGs that are compatible with all government and job portals.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Sparkles className="text-yellow-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">High Quality (HD)</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our local encoder uses a 92% quality floor to ensure text and faces remain crisp after transformation.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <ShieldCheck className="text-green-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Offline Logic</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">100% Browser-based. Your personal photos and documents are never sent to a cloud server.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Image to JPG FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why should I convert PNG to JPG?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            PNG files are often 5-10x larger than JPGs because they are lossless. Converting to JPG significantly reduces file size while maintaining visual clarity, making them easier to upload to portals or email.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Will I lose quality during conversion?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            JPG is a lossy format, but our <strong>GR7 Standard</strong> uses high-fidelity compression settings. For most users, the difference between the original and the converted JPG is invisible to the naked eye.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">What happens to transparent backgrounds?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            JPEG does not support transparency (Alpha channel). If you upload a transparent PNG, our tool will automatically fill the transparent areas with <strong>Pure White</strong> background for a professional look.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
