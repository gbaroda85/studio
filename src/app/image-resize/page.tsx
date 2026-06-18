import { Metadata } from 'next';
import ImageResizer from '@/components/image-resizer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles } from 'lucide-react';

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
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Image Resizer Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Exact pixel and mm resizing for government job forms. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ImageResizer />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Professional Image Resizer" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional Grade Dimension Control
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                        Resizing images for official portals like <strong>SSC, UPSC, or Bank forms</strong> can be tricky. Standard tools often blur the text or stretch the face. Our <strong>Smart Resizer</strong> is calibrated for exact official requirements with zero data risk.
                    </p>
                </div>
            </section>
        </div>
    </main>
  );
}
