
import { Metadata } from 'next';
import { HelpCircle, Sun, Zap, ShieldCheck, Cpu, Sparkles, Maximize } from 'lucide-react';
import { BackgroundRemoverClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Background Remover - High-Precision AI Image Extraction Online',
  description: 'Pro-grade background removal using local AI technology. Perfect for hair detection, edge precision, and transparent PNG export. 100% private local RAM processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/remove-background' }
};

export const dynamic = 'force-dynamic';

export default function RemoveBackgroundPage() {
  const deepSteps = [
    {
      title: "Neural Import",
      description: "Upload your photo. Our local engine initializes the neural weights in your browser RAM, ensuring zero data leaves your device.",
      icon: "UploadCloud"
    },
    {
      title: "Segmentation Stage",
      description: "Click 'Remove Background'. The AI analyzes every pixel with edge-aware convolution, specifically optimizing for complex hair and textures.",
      icon: "Wand2"
    },
    {
      title: "Visual Audit",
      description: "Use the Comparison Slider to check the edge quality. Our studio renders a 300DPI mask that preserves the original image resolution perfectly.",
      icon: "ArrowLeftRight"
    },
    {
      title: "Industrial Export",
      description: "Choose a solid background or keep it transparent. Click 'Download PNG' to save your HD sanitized asset, ready for professional use.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-4 px-4">
            <BackgroundRemoverClient />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Background Remover" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Cpu className="text-primary size-8" />
                        Next-Gen On-Device AI
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Forget blurry edges. Our <strong>Background Studio</strong> uses state-of-the-art transformer models to distinguish subjects from shadows with surgical precision.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Sparkles className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Hair Precision</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Proprietary mask softening algorithm that captures individual hair strands and translucent edges without 'halo' effects.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Maximize className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Res-Loss</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">We don't downscale your photos. The AI model creates a high-res mapping that is applied back to your original source file.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Air-Gapped Tech</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">All neural inference happens on your local GPU/CPU. Your private photos never touch the internet or any third-party cloud.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Background Removal FAQs</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why is this tool better than remove.bg?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Remove.bg and others are paid and limit your resolution. **GR7 Neural Studio** is 100% free, offers unlimited usage, and preserves your **Original HD Resolution** by running the AI model directly on your device.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it work with low-end mobile phones?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes! Our model uses **Optimized ONNX Runtime**. It will automatically detect if your device supports WebGPU for high speed, otherwise it will use WebAssembly (WASM) to process the image slightly slower.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is it safe for sensitive personal ID photos?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. This is the **most secure** way to remove backgrounds. Since no data is uploaded to a server, your ID cards, passports, and private selfies stay entirely on your device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
