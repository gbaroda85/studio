import { Metadata } from 'next';
import { Palette, Sparkles, ShieldCheck, Zap, Layers, Smartphone, MonitorCheck, HelpCircle, Contrast } from 'lucide-react';
import ColorPicker from '@/components/color-picker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional Color Picker Studio - Palette Generator & Contrast Checker Online',
  description: 'Identify colors, generate beautiful palettes, and check WCAG contrast ratios instantly. HEX, RGB, HSL and CMYK support with local RAM privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/color-picker' }
};

export default function ColorPickerPage() {
  const deepSteps = [
    {
      title: "Visual Sampling",
      description: "Use the Spectrum Wheel to pick any color or click the 'Eyedropper' icon to sample colors from anywhere on your screen using native browser APIs.",
      icon: "Pipette"
    },
    {
      title: "Format Mapping",
      description: "Instantly see the color translated into HEX, RGB, HSL, and CMYK. Click the 'Copy' icon next to any value to move it to your system clipboard.",
      icon: "ArrowRightLeft"
    },
    {
      title: "Accessibility Audit",
      description: "Monitor the real-time WCAG 2.1 contrast ratio for Black and White text. The engine verifies if your color is safe for UI/UX accessibility.",
      icon: "Contrast"
    },
    {
      title: "Palette Logic",
      description: "Our studio automatically generates Complementary, Analogous, and Triadic palettes based on color theory math for your design projects.",
      icon: "Layers"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Color Picker Studio
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-xl mx-auto text-xs md:text-sm">
                    Identify colors, generate palettes and check contrast ratios. 100% Private local RAM processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ColorPicker />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Color Picker Studio" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Designer Toolkit
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Stop using multiple sites for design math. Our <strong>Professional Color Studio</strong> combines a high-fidelity picker with color theory logic to help you build accessible brand identities.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <Palette className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Color Theory</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Advanced mathematical mapping for complementary, analogous, and triadic color harmonies instantly.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Contrast className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">WCAG Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Built-in accessibility engine verifies contrast ratios to ensure your designs meet international legal standards.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Server Log</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">All conversion math happens in your browser RAM. Your proprietary brand colors never touch our server.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Color FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is contrast ratio and why does it matter?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Contrast ratio measures the difference in luminance between text and its background. For web accessibility (**WCAG 2.1**), a ratio of **4.5:1** is required for normal text. Our tool helps you verify this in real-time.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I sample a color from another website?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Click the **"Eyedropper"** button in the Studio Panel. This activates your browser's native color picking tool, allowing you to click anywhere on your screen (even outside the browser) to capture a HEX code.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use these colors for professional printing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. We provide the **CMYK** (Cyan, Magenta, Yellow, Key) values which are the standard for industrial printing. However, always verify with your print house as screen-to-paper calibration can vary.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
