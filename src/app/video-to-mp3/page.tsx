import { Metadata } from 'next';
import { Music, ShieldCheck, HelpCircle, FileVideo, Zap, MonitorPlay } from 'lucide-react';
import VideoToMp3Converter from '@/components/video-to-mp3-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Video to MP3 Converter - Extract High Quality Audio Online Privately',
  description: 'Convert MP4, WebM, and other video formats to high-quality audio files instantly. 100% private local browser extraction with zero server uploads.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/video-to-mp3' }
};

export default function VideoToMp3Page() {
  const deepSteps = [
    {
      title: "Media Import",
      description: "Select or drag your video file into the studio. Our engine initializes a high-fidelity buffer in local RAM to prepare for stream isolation.",
      icon: "FileVideo"
    },
    {
      title: "Buffer Decoding",
      description: "Click 'Extract Audio'. The browser's native decoding engine interprets the audio track bitstream without any quality loss.",
      icon: "Zap"
    },
    {
      title: "Audio Sanitization",
      description: "The extracted PCM data is mapped to a standard WAV/MP3 container, ensuring 100% compatibility with all media players and devices.",
      icon: "MonitorPlay"
    },
    {
      title: "HD Export",
      description: "Preview the isolated audio using our built-in player. Click 'Save' to download your professional audio file instantly to your device.",
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
                        Video to MP3 Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Extract high-fidelity audio from any video instantly. 100% Private local RAM extraction.
                </p>
            </div>

            <div className="w-full flex justify-center mb-12 px-4">
                <VideoToMp3Converter />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20 no-print">
            <HowToGuide title="Video to Audio Converter" steps={deepSteps} />

            {/* Deep SEO Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Music className="text-primary size-8" />
                        Professional Audio Isolation
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard converters often compress audio. Our <strong>Professional Audio Engine</strong> extracts the raw stream directly from the container, ensuring you get the exact same quality as the original source.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                            <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                <Zap className="text-cyan-500 size-6" />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">PCM Fidelity</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Uses 32-bit floating point decoding to preserve the full dynamic range of the original video soundtrack.</p>
                        </div>
                    </div>

                    <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                            <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                <MonitorPlay className="text-indigo-500 size-6" />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Instant Preview</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Built-in HTML5 player lets you listen to the extracted audio before saving to ensure perfect result.</p>
                        </div>
                    </div>

                    <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                            <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                <ShieldCheck className="text-purple-500 size-6" />
                            </div>
                            <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">Air-Gapped Tech</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">All work happens on your local device. Your sensitive video clips and voice recordings never touch the cloud.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Conversion FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Will the audio quality be reduced?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            No. Our tool uses **Native Decoding**. It doesn't re-record the audio; it isolates the existing audio stream from the video file, preserving every detail of the original bitrate and sample rate.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">What formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            We support all standard video formats playable in your browser, including **MP4, WebM, MOV, and AVI**. The extracted file is saved as a high-compatibility WAV/MP3 format.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe for private recordings?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Absolutely. This is the **most secure** method for audio extraction. Since there is no server upload, your private lectures, interviews, or family clips stay strictly on your device.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
