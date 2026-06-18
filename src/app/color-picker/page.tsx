import { Metadata } from 'next';
import { Palette, Sparkles, ShieldCheck, Zap, Layers, Smartphone, MonitorCheck, HelpCircle, Contrast, Monitor } from 'lucide-react';
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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=converters" label="Back to Converters" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Color Picker Studio
                    </span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Identify colors, generate palettes and check contrast ratios. 100% Private local RAM processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ColorPicker />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Color Picker Studio" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Designer Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Our <strong>Professional Studio</strong> combines high-fidelity color sampling with WCAG accessibility validation for industrial-grade UI/UX design.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-cyan-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">WCAG VALIDATION</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Real-time contrast checker verifies if your colors meet international accessibility laws for text visibility.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Monitor className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">COLOR THEORY</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Engineered to auto-generate complementary, analogous, and triadic harmonies using precise mathematical mapping.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO DATA LEAK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Your proprietary brand colors stay 100% on your device. We never store or track your specific HEX or RGB queries.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Color FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">What is contrast ratio and why does it matter?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Contrast ratio measures the difference in luminance between text and its background. For web accessibility (**WCAG 2.1**), a ratio of **4.5:1** is required for normal text. Our tool helps you verify this in real-time.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How do I sample a color from another website?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Click the **"Eyedropper"** button in the Studio Panel. This activates your browser's native color picking tool, allowing you to click anywhere on your screen (even outside the browser) to capture a HEX code.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Can I use these colors for professional printing?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                            Yes. We provide the **CMYK** (Cyan, Magenta, Yellow, Key) values which are the standard for industrial printing. However, always verify with your print house as screen-to-paper calibration can vary.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
