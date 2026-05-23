import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Eraser, ShieldCheck, Zap, HelpCircle, Target, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundRemover from '@/components/background-remover';
import { HowToGuide } from '@/components/how-to-guide';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'AI Background Remover - Remove BG from Photos Online Instantly (Free)',
  description: 'Professional local AI tool to remove background from images. Create high-definition transparent PNGs or passport photos with custom backgrounds. 100% private and secure.',
};

export const dynamic = 'force-dynamic';

export default function RemoveBackgroundPage() {
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
            <BackgroundRemover />
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-16">
            <HowToGuide title="AI Background Remover" steps={[
                "Upload Photo: Select an image with a clear face or object.",
                "AI Processing: Our local neural engine extracts the subject in HD.",
                "Custom Background: Choose from Royal Blue, Navy, or White for official use.",
                "Fine-Tune: Adjust the frame or add a professional border.",
                "Download: Save as a high-quality transparent PNG or solid JPEG."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Professional ID Studio in your Browser</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">No need to visit a photo studio or use expensive software like Photoshop. Our <strong>AI Background Remover</strong> uses state-of-the-art WASM technology to run a neural network directly on your device CPU.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Target className="text-primary size-8" />
                        <h3 className="font-bold uppercase text-sm">100% Precision</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Edge detection for hair and fine details ensures a clean cut every time, even with complex backgrounds.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Layers className="text-blue-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Official Colors</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Quickly switch to Royal Blue or White backgrounds, mandatory for Indian Passports and Visa applications.</p>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-3xl space-y-3 border border-primary/5">
                        <Zap className="text-yellow-500 size-8" />
                        <h3 className="font-bold uppercase text-sm">Zero Latency</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">No queues, no credits, no limits. Process as many photos as you want at native hardware speed.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Background Removal FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Why is this tool safer than "Cloud" removers?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Cloud-based background removers store your photos on their servers to train their AI. This is a massive privacy risk for your personal ID photos. Our tool runs the AI **locally in your browser RAM**, meaning your photo never touches the internet.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Does it work for Passport Photos?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Absolutely! You can remove the background, select "Royal Blue" or "Pure White" as the background color, and set the exact size in MM or Inch for any country's passport requirements.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold">Can it remove backgrounds from complex objects?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            Yes, our neural model is trained on a wide variety of subjects including humans, pets, and e-commerce products. It performs exceptionally well with distinct contrast between the subject and background.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
