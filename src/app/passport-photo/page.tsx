
import { Metadata } from 'next';
import { UserCircle, ShieldCheck, HelpCircle, FileCheck, Printer, Maximize } from 'lucide-react';
import PassportPhotoMaker from '@/components/passport-photo-maker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional Passport Photo Maker - Create ID Photos Online with AI (HD)',
  description: 'Create professional passport-sized photos for India, USA, and UK instantly. Features AI background removal, rotation, and high-DPI scaling. 100% private local processing.',
};

export default function PassportPhotoPage() {
  const steps = [
    "Upload Photo: Select a clear, well-lit photo of your face.",
    "Select Size: Choose from presets like India (3.5x4.5cm) or USA (2x2in).",
    "Crop & Align: Use the crop tool to center your face perfectly.",
    "AI Background: Click 'AI REMOVE' to isolate the subject with one click.",
    "Studio Adjust: Rotate, scale, and choose a background color (White/Blue).",
    "Download: Save your 300 DPI HD photo ready for printing."
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" className="mb-2" />

        <div className="w-full flex justify-center mb-2 px-4">
            <PassportPhotoMaker />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16 px-4">
            <HowToGuide title="Professional Passport Maker" steps={steps} />

            {/* Deep Value Section */}
            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Standard ID Photo Requirements</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Meeting official document standards is critical. A slight tilt or wrong background can lead to form rejection. Our <strong>AI Studio</strong> ensures your photos meet strict government criteria.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-primary/5 space-y-4">
                        <Maximize className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Dimension Control</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Exact support for India Passport (35x45mm), USA Visa (2x2 inch), and Indian PAN Card requirements.</p>
                    </div>
                    <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-primary/5 space-y-4">
                        <FileCheck className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">AI Isolation</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our local neural engine performs pixel-level edge detection to remove messy backgrounds instantly.</p>
                    </div>
                    <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-primary/5 space-y-4">
                        <Printer className="text-rose-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">300 DPI Export</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Rendered at high resolution to ensure your physical prints look professional and sharp on photo paper.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Passport Photo FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about official ID photos.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which background color is required for Indian Passports?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            For **Indian Passport and Visa** applications, a **Pure White** background is mandatory. Use our 'AI Remove' tool and then select the White color preset in the Studio stage.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I fix a photo that is slightly tilted?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We have added a **Rotate Slider** in the Studio mode. Simply move the slider to straighten your face horizontally. Ensure that your eyes are at the same level for a professional look.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I wear glasses in my passport photo?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            It is recommended to **remove glasses** to avoid glare and reflections. Most countries like the USA explicitly forbid glasses in visa and passport photos unless medically necessary.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is the best way to print these photos?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            After downloading the HD photo, you can use any standard 4x6 inch photo paper. A 4x6 sheet can usually fit **8 passport-sized (3.5x4.5cm) photos**. Ensure your printer settings are set to 'High Quality' and 'Actual Size'.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
