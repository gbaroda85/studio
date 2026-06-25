
import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Zap, Volume2, Sparkles, FileAudio, LayoutList, MonitorCheck, Download } from 'lucide-react';
import { Mp3CompressorClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Professional MP3 Compressor - Shrink Audio Size Online Free (HD)',
  description: 'Compress MP3, WAV, and M4A files while maintaining high fidelity. Choose between easy presets or advanced bitrate controls. 100% private local browser processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/compress-mp3' }
};

export default function CompressMp3Page() {
  const deepSteps = [
    {
      title: "Audio Handshake",
      description: "Select any MP3, WAV, or M4A file up to 500MB. Our local engine initializes a high-fidelity decoding buffer in your browser RAM.",
      icon: "UploadCloud"
    },
    {
      title: "Engine Calibration",
      description: "Choose 'Easy Mode' for fast results or 'Pro Mode' to manually set bitrates (320kbps to 48kbps) and sample rates for precision reduction.",
      icon: "Settings2"
    },
    {
      title: "HD Re-Encoding",
      description: "Click 'Compress Now'. The engine re-maps the psychoacoustic bitstream locally using 32-bit floating point precision to minimize artifacts.",
      icon: "Zap"
    },
    {
      title: "Sanitized Save",
      description: "Listen to the A/B comparison preview. Click 'Download' to save your optimized high-quality MP3 file instantly to your device.",
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
                        MP3 Compressor Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Reduce file size while maintaining high-fidelity audio. 100% Private local RAM processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <Mp3CompressorClient />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="Professional MP3 Compressor" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Industrial Grade Audio Extraction
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Standard compressors destroy detail. Our <strong>Professional Studio</strong> uses psychoacoustic modeling to identify and preserve the most critical frequencies while discarding digital noise.
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
                                    <Sparkles className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">Lossless Decode</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Every file is decoded to raw PCM samples first to ensure the base for compression is 100% clean and artifact-free.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <LayoutList className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Bitrate Sync</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Full support for Constant Bit Rate (CBR) and Variable Bit Rate (VBR) standards for maximum compatibility.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">Privacy First</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your private voice notes, podcasts, and songs never leave your device. All processing is 100% local.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Compression FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will I lose audio quality?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            MP3 is a lossy format, but our engine is tuned to minimize this. If you select **192kbps or higher**, the difference is virtually imperceptible to the human ear for standard listening.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Which bitrate should I choose?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            For **Music**, we recommend **192-320kbps**. For **Voice Notes or Podcasts**, you can safely drop to **64-128kbps** to save massive space without losing vocal clarity.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is there a file size limit?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            The tool works locally in your browser RAM. Most modern smartphones and PCs can handle audio files up to **500MB** easily. If the browser tab crashes, try closing other tabs to free up memory.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
