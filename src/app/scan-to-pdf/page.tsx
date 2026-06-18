import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, ScanLine, Smartphone, MonitorCheck } from 'lucide-react';
import ScannerToPdf from '@/components/scanner-to-pdf';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Scan to PDF - Turn Device Camera into a Mobile Document Scanner Online',
  description: 'Scan physical documents using your mobile or desktop camera and save them as professional PDFs. 100% local, secure, and easy document scanning.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/scan-to-pdf' }
};

export default function ScanToPdfPage() {
  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ScannerToPdf />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Mobile PDF Scanner" steps={[
                "Camera Permission: Allow the browser to access your camera (Environment mode).",
                "Capture: Align your document in the viewfinder and click 'Scan Current Page'.",
                "Crop: Fine-tune the edges to remove table or background clutter.",
                "Bundle: Capture as many pages as needed for your document.",
                "Generate: Click 'Create PDF' to bundle everything into one high-quality file."
            ]} />

            {/* AdSense Ready Content */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <ScanLine className="text-primary size-8" />
                        Portable Office in your Browser
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        No need for a bulky flatbed scanner or paid mobile apps. Our <strong>Scan-to-PDF Studio</strong> uses your device's high-res camera to capture and digitize paperwork instantly with full privacy.
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
                                    <Smartphone className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">Mobile Optimized</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Specifically designed to trigger the back camera on Android and iPhone for the best document quality.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <MonitorCheck className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">Edge Cropping</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Built-in cropping tool allows you to isolate the document from the background, making it look professional.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">Local Privacy</h3>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your camera feed and captured images stay 100% on your device. We never see what you scan.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-12 text-primary mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Scanning FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Why is my scan blurry?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Ensure you have **good lighting** (natural daylight is best). Hold your phone steady and wait for the camera to focus on the text before clicking the scan button.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">How many pages can I scan at once?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Our tool supports multi-page scanning. You can scan as many pages as your device's memory can handle. For a typical report, 20-30 pages are perfectly fine.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2">
                        <AccordionTrigger className="text-lg font-bold text-left">Is this better than taking a normal photo?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Yes. A normal photo is a loose image file. Our tool lets you **crop** out the background and bundles multiple photos into a single, professional **PDF document** ready for official submission.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
