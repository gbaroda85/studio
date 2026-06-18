import { Metadata } from 'next';
import { UserCircle, ShieldCheck, HelpCircle, FileCheck, Printer, Maximize, Zap, Settings2 } from 'lucide-react';
import { PassportPhotoMakerClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional Passport Photo Maker - Create ID Photos Online (HD)',
  description: 'Create professional passport-sized photos for India, USA, and UK instantly. Features background removal, rotation, and high-DPI scaling. 100% private local processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/passport-photo' }
};

export default function PassportPhotoPage() {
  const deepSteps = [
    {
      title: "Standards Selection",
      description: "Select your target document (India Passport, US Visa, SSC Photo). Our engine automatically sets the exact ISO millimeter dimensions required by governments.",
      icon: "Maximize"
    },
    {
      title: "AI Subject Isolation",
      description: "Upload your photo and click 'AI REMOVE BACKGROUND'. Our local engine uses pixel-level edge detection to isolate your face without any server uploads.",
      icon: "Zap"
    },
    {
      title: "Studio Calibration",
      description: "Fine-tune with the rotate and scale sliders. Adjust brightness and contrast to match professional studio profiles. Select 'Pure White' background for official use.",
      icon: "Settings2"
    },
    {
      title: "HD Print Layout",
      description: "Download the final JPG at 300DPI. You can also generate a 'Master Print Sheet' (4x6 inch) which auto-grids 8 passport photos for easy printing.",
      icon: "Printer"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" className="mb-2" />

        <div className="w-full flex justify-center mb-2 px-4">
            <PassportPhotoMakerClient />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Professional Passport Maker" steps={deepSteps} />

            {/* Deep Value Section */}
            <section className="space-y-12 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Official ID Standards</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Meeting official document standards is critical. A slight tilt or wrong background can lead to form rejection.
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
                                    <Maximize className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">DIMENSION CONTROL</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Exact support for India Passport (35x45mm), USA Visa (2x2 inch), and Indian PAN Card requirements.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">SMART ISOLATION</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Our local engine performs pixel-level edge detection to remove messy backgrounds instantly.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <Printer className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">300 DPI EXPORT</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Rendered at high resolution to ensure your physical prints look professional and sharp on photo paper.</p>
                            </div>
                        </div>
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
                            For **Indian Passport and Visa** applications, a **Pure White** background is mandatory. Use our 'Auto Remove' tool and then select the White color preset in the Studio stage.
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
