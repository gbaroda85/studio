import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, Layout, MonitorCheck, Layers } from 'lucide-react';
import ImageToPdfConverter from '@/components/image-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Image to PDF Converter - Convert Multiple Photos with Layout Control Online',
  description: 'Convert JPG, PNG, and WEBP to PDF with Top, Center, and Bottom alignment. Professional tool to bundle photos into a high-quality A4 PDF document instantly.',
};

export default function ImageToPdfPage() {
  const deepSteps = [
    {
      title: "Batch Import",
      description: "Upload one or multiple images. Our engine initializes a high-fidelity buffer to ensure every pixel is mapped correctly without any server uploads.",
      icon: "UploadCloud"
    },
    {
      title: "Alignment Lock",
      description: "Use 'Literal Top' or 'Bottom' alignment. This strictly clamps the image to the edge of the A4 page, perfect for signatures and document segments.",
      icon: "AlignVerticalJustifyCenter"
    },
    {
      title: "Orientation Fix",
      description: "Select any page to rotate 90° clockwise. Our local transformer recalculates the canvas dimensions to prevent any stretching or pixelation.",
      icon: "RotateCw"
    },
    {
      title: "A4 Master Render",
      description: "Click 'Build PDF'. The engine bundles all pages into a sanitized 300DPI document. Save your professional file instantly to your device.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ImageToPdfConverter />
        </div>

        <div className="w-full max-w-4xl space-y-16 px-4">
            <HowToGuide title="Advanced Image to PDF" steps={deepSteps} />

            {/* AdSense Ready Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                        <Layout className="text-primary size-8" />
                        Professional Layout & Positioning
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Standard converters force stretch images, making small photos blurry. Our <strong>Image to PDF Pro</strong> gives you full control over vertical alignment and scaling, ensuring your digital documents look clean and professional.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <MonitorCheck className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">Live Preview</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">See your document in a browser-native preview box before you download. No more guesswork or repeated downloads.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Layers className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">High-DPI Export</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our engine renders pages in high-definition (300 DPI equivalent) to ensure scanned text and signatures remain perfectly readable.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <ShieldCheck className="text-emerald-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest">100% Client-Side</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">We respect your data. Every byte of the PDF is generated in your computer's RAM. No files ever leave your device.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
