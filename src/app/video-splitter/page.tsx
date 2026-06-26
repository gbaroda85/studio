import { Metadata } from 'next';
import VideoSplitter from '@/components/video-splitter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
    Scissors, 
    ShieldCheck, 
    HelpCircle, 
    Zap, 
    Sparkles, 
    Clock, 
    LayoutGrid, 
    Download,
    Cpu,
    Video
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professional Video Splitter - Split MP4, WebM & MOV Online (HD)',
  description: 'Split video files into multiple smaller clips by duration, equal parts, or custom timestamps. 100% private local browser-based splitting with zero quality loss.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/video-splitter' }
};

export default function VideoSplitterPage() {
  const deepSteps = [
    {
      title: "Media Import",
      description: "Select or drag your video file. Our local engine initializes a high-fidelity buffer in your browser RAM, ensuring zero data persistence on servers.",
      icon: "FileVideo"
    },
    {
      title: "Split Protocol",
      description: "Choose your method: 'Equal Parts' for auto-division, 'Duration' for fix-length clips, or 'Custom' for specific start/end timestamps.",
      icon: "Settings2"
    },
    {
      title: "WASM Processing",
      description: "The engine executes ffmpeg.wasm logic to extract bitstreams at native hardware speed, preserving 100% original quality.",
      icon: "Zap"
    },
    {
      title: "HD Export",
      description: "Download individual clips or the entire bundle as a clean ZIP archive. Perfect for social media reels, WhatsApp status, and archiving.",
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
                        Video Splitter Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Divide videos into multiple parts with 100% fidelity. Safe, fast, and entirely local on your device.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <VideoSplitter />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="Professional Video Splitter" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Industrial Grade Extraction
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard splitters often re-encode and lose detail. Our <strong>Professional Studio</strong> uses raw bitstream mapping to cut videos without any quality degradation.
                    </p>
                </div>
                
                <div className="relative">
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <Cpu className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">NATIVE WASM</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Uses WebAssembly technology to process files at hardware speed without server communication or cloud delays.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">ZERO LOSS</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Employs bitstream copying logic. Your video resolution, bitrate, and frame rate remain untouched.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">PRIVACY LOCK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Your private videos, family clips, and work files never touch any server. Total local security.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Splitting FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Which video formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Our studio supports all standard formats including **MP4, WebM, MOV, and AVI**. The output is usually a highly compatible MP4 format.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">How many parts can I split into?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            You can split into any number of parts. For **Equal Parts**, we support up to 20 segments. For **Duration**, you can specify any time in seconds.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe for large video files?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. **GR7 Smart Studio** is a client-side utility. We support files up to **500MB** for smooth browser processing. Your data never touches a server.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
