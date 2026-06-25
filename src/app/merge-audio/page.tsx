
import { Metadata } from 'next';
import AudioMerger from '@/components/audio-merger';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
    Music, 
    ShieldCheck, 
    HelpCircle, 
    Zap, 
    Sparkles, 
    Merge, 
    Volume2, 
    FileOutput, 
    Download,
    Layers,
    Clock
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professional Audio Merger - Combine MP3, WAV & M4A Online (HD)',
  description: 'Combine multiple audio tracks into a single high-quality file. 100% private local processing. Re-order clips visually and export as MP3, WAV or OGG instantly.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/merge-audio' }
};

export default function MergeAudioPage() {
  const deepSteps = [
    {
      title: "Track Import",
      description: "Select multiple audio files. Our engine initializes a safe buffer stack in your browser RAM, ensuring zero data persistence on servers.",
      icon: "UploadCloud"
    },
    {
      title: "Stack Sequence",
      description: "Use the up/down arrows to adjust the playing order of your clips. Precise sequencing is essential for podcasts and music medleys.",
      icon: "Layers"
    },
    {
      title: "Format Handshake",
      description: "Choose your desired output format (MP3, WAV, etc.) from the config panel. The engine re-maps samples at high-fidelity local speed.",
      icon: "Settings2"
    },
    {
      title: "Unified Save",
      description: "Click 'Merge Tracks'. Our local joiner bundles all samples into a single sanitized audio file ready for sharing.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=audio" label="Back to Audio Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Audio Merger Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Combine multiple tracks into one professional audio file. 100% Private local RAM joiner.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <AudioMerger />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="Professional Audio Merger" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Industrial Grade Audio Bundling
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Joining tracks shouldn't be complex. Our <strong>Professional Studio</strong> uses high-fidelity PCM mapping to combine tracks without any quality degradation or gaps.
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
                                    <Merge className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">PCM SYNC</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Tracks are decoded to raw samples and joined with zero-gap accuracy for professional flow.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Clock className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">UNLIMITED LENGTH</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Join small voice notes or full-length podcast segments. Only limited by your device memory.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">100% PRIVATE</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Your private recordings never leave your device. All merging happens 100% in your local RAM.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Merging FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Which audio formats can I merge?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Our studio supports all standard formats including **MP3, WAV, M4A, OGG, and AAC**. You can upload a mix of different formats and merge them into one single file.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will there be gaps between the tracks?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            No. Our engine uses **sample-accurate joining**. This means one track starts at the exact millisecond the previous one ends, providing a seamless "continuous" listening experience.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe for private voice notes?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. **GR7 Smart Studio** is a client-side utility. Your audio data never touches a server. All the math happens in your local RAM and is wiped when you close the tab.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
