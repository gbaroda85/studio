import { Metadata } from 'next';
import RotateVideoConverter from '@/components/rotate-video';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RotateCw, ShieldCheck, HelpCircle, FileVideo, Zap, MonitorPlay } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rotate Video Online - Permanently Rotate 90, 180 Degrees Privately',
  description: 'Easily rotate your video files online. Fix sideways videos from phones instantly. Supports MP4, WebM and MOV. 100% private local browser processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/rotate-video' }
};

export default function RotateVideoPage() {
  const deepSteps = [
    {
      title: "Media Import",
      description: "Select or drag your sideways video file into the studio. Our engine initializes a high-fidelity local buffer to prepare for frame re-orientation.",
      icon: "FileVideo"
    },
    {
      title: "Visual Alignment",
      description: "Use the rotation buttons (90° Left/Right) to fix the orientation. Our studio provides a real-time preview of the corrected angle.",
      icon: "RotateCw"
    },
    {
      title: "Neural Re-Encoding",
      description: "The engine maps the bitstream to a fresh high-resolution canvas. It reconstructs the video frames at the new angle with 100% fidelity.",
      icon: "Zap"
    },
    {
      title: "Sanitized Save",
      description: "Click 'Save Rotated Video' to download your corrected file. Everything happens locally in your RAM for total data privacy.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=video" label="Back to Video Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Rotate Video Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Permanently fix sideways videos with professional local rotation. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center mb-12 px-4">
                <RotateVideoConverter />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="Rotate Video Studio" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <RotateCw className="text-primary size-8" />
                        Professional Orientation Fix
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard players only rotate the view. Our <strong>Professional Studio</strong> re-encodes the video data permanently so it opens correctly on all devices, TVs, and social media apps.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                            <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                <Zap className="text-cyan-500 size-6" />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">NATIVE SYNC</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Uses your browser's hardware acceleration to re-map frames at high speed without any server-side lag.</p>
                        </div>
                    </div>

                    <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                            <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                <MonitorPlay className="text-indigo-500 size-6" />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">WYSIWYG VIEW</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">What You See Is What You Get. Preview the exact rotation and aspect ratio before you click save.</p>
                        </div>
                    </div>

                    <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                            <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                <ShieldCheck className="text-purple-500 size-6" />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO DATA LEAK</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Your private video clips are processed in your local device RAM. No server uploads, no privacy risk.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Rotation FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will the video quality decrease?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            No. Our studio uses **High-Fidelity Canvas Recording**. It captures frames at their original resolution and re-maps them to the new orientation, ensuring minimal quality loss during the process.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">What video formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            We support all standard video formats playable in your browser, including **MP4, WebM, and MOV**. The rotated file is saved as a high-compatibility MP4/WebM format.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe for private family videos?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. **GR7 Smart Studio** is a client-side utility. Your video data never touches a server. All the math and rendering happen in your local RAM and are wiped when you close the tab.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
