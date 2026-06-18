import { Metadata } from 'next';
import { UserCircle, ShieldCheck, HelpCircle, FileCheck, Printer, Maximize, Zap, Settings2, X, ChevronDown, Sparkles } from 'lucide-react';
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
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Passport Photo Maker
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Create official passport-sized photos for India, USA and UK instantly. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center mb-2 px-4">
                <PassportPhotoMakerClient />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
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
        </div>
    </main>
  );
}
