import { Metadata } from 'next';
import { ShieldCheck, HelpCircle, User, PenTool, Scaling, Layers, Maximize } from 'lucide-react';
import ImageResizer from '@/components/image-resizer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Smart Image Resizer - Resize for SSC, UPSC, IBPS Application Forms Online',
  description: 'Exact pixel and mm resizing for government job forms. Resize photos to 200x230px and signatures to 140x60px instantly and privately in your browser.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-resize' }
};

export default function ImageResizePage() {
  const steps = [
    "Upload Image: Select the photo or signature you want to resize.",
    "Select Mode: Use 'Govt Job Presets' or enter custom Pixel/MM values.",
    "Lock Ratio: Keep 'Maintain Aspect Ratio' checked to avoid stretching.",
    "Format: Choose JPEG (for forms) or PNG/WebP.",
    "Download: Save your perfectly sized image locally."
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-10 md:pt-16">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex justify-center mb-12 px-4">
            <ImageResizer />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Professional Image Resizer" steps={steps} />

            {/* In-depth Content Section */}
            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        <Scaling className="text-primary size-8" />
                        Professional Grade Dimension Control
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Resizing images for official portals like <strong>SSC, UPSC, or Bank forms</strong> can be tricky. Standard tools often blur the text or stretch the face. Our <strong>Smart Resizer</strong> is calibrated for exact official requirements with zero data risk.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/40 transition-all">
                        <User className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Passport Ready</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">One-click presets for 200x230px and other standard passport dimensions used in Indian competitive exams.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <PenTool className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Signature Mode</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Convert scanned signatures to 140x60px instantly while maintaining high contrast for better legibility on digital forms.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/40 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Local Privacy</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Since processing happens in your browser RAM, your sensitive ID cards and personal documents never touch any server.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
