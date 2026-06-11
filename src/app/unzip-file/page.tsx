import { Metadata } from 'next';
import { HelpCircle, ShieldCheck, Zap, FileArchive, Unlock, Lock } from 'lucide-react';
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
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=file" label="Back to File Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 pt-10 md:pt-16">
            <div className="w-full flex justify-center">
                <Unzipper />
            </div>
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Professional Unzipper" steps={steps} />

            {/* Deep SEO Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <FileArchive className="text-primary size-8" />
                        Professional Archive Management
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Dealing with compressed folders shouldn't compromise your privacy. Our <strong>Professional Unzipping Engine</strong> uses client-side decryption to let you access your files at native hardware speeds.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <ShieldCheck className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Cloud Risk</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Unlike "cloud" converters, we never store your ZIP files. The extraction happens 100% in your browser's temporary memory (RAM).</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Zap className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">WASM Speed</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Uses WebAssembly technology to extract large archives at lightning speeds. No waiting for server queues or processing lag.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <Lock className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Secure Sandbox</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your files are extracted into a local virtual sandbox. Once you close the tab, all traces of the files are wiped from your device memory.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t pb-24">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Unzipping FAQs</h2>
                    <p className="text-muted-foreground font-medium">Everything you need to know about secure archive extraction.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is there a limit on ZIP file size?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            The limit depends entirely on your device's available RAM. Most modern smartphones and PCs can easily handle ZIP files up to **500MB to 1GB**. For massive files above 2GB, we recommend using desktop software for stability.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Does it support password-protected archives?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Currently, our tool supports standard non-encrypted archives. Support for **AES-encrypted ZIP** files with password entry is coming in our next studio update.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Which archive formats are supported?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            We have full support for **.zip** and **.zipx** formats. Support for **.rar** and **.7z** is currently in beta and will be rolled out to all users soon.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Where do my files go after extraction?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            When you click 'Download' on an extracted file, it is saved directly to your browser's default **Downloads** folder. No data is stored on our servers at any point during this process.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
