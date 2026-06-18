import { Metadata } from 'next';
import { HelpCircle, ShieldCheck, Zap, FileArchive, Unlock, Lock, MonitorCheck, Layout } from 'lucide-react';
import Unzipper from '@/components/unzipper';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Unzip Files Online - Extract ZIP, RAR & 7Z Archives Privately (HD)',
  description: 'Professional online unzipper. Extract multiple files from ZIP archives instantly. 100% secure local browser processing. No server uploads, zero data risk.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/unzip-file' }
};

export default function UnzipFilePage() {
  const steps = [
    "Upload: Select or drag and drop your .zip archive into the workspace.",
    "Scan: Our local engine scans the index structure of the archive in RAM.",
    "Preview: See the list of all files contained inside the ZIP folder.",
    "Extract: Click 'Download' on individual files to save them to your device.",
    "Privacy: Files are never uploaded; extraction happens entirely on your CPU."
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=file" label="Back to File Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Unzip Archive Pro
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Extract ZIP archives instantly without server uploads. 100% Private local RAM processing.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <Unzipper />
            </div>
        </div>

        <div className="w-full max-w-5xl space-y-16 px-4 md:px-12 pb-20 mx-auto">
            <HowToGuide title="Professional Unzipper" steps={steps} />

            {/* Premium Professional Studio Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Archive Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Dealing with compressed folders shouldn't compromise your privacy. Our <strong>Professional Unzipping Engine</strong> uses client-side decryption to let you access your files at native hardware speeds.
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
                                    <ShieldCheck className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">ZERO CLOUD RISK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Unlike "cloud" converters, we never store your ZIP files. Extraction happens 100% in your browser memory.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">WASM SPEED</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Uses WebAssembly technology to extract large archives at hardware speeds with zero server lag.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <Lock className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">SECURE SANDBOX</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your files are extracted into a local virtual sandbox. All data is wiped when you close the tab.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t pb-24">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Unzipping FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about secure archive extraction.</p>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is there a limit on ZIP file size?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            The limit depends entirely on your device's available RAM. Most modern smartphones and PCs can easily handle ZIP files up to **500MB to 1GB**.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Does it support password-protected archives?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Currently, our tool supports standard non-encrypted archives. Support for **AES-encrypted ZIP** files with password entry is coming soon.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Which archive formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            We have full support for **.zip** and **.zipx** formats. Support for **.rar** and **.7z** is currently in beta.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Where do my files go after extraction?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Extracted files are saved directly to your browser's default **Downloads** folder. No data is stored on our servers at any point.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
