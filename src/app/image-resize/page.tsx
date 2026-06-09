import { Metadata } from 'next';
import { Scaling, Trophy } from 'lucide-react';
import ImageResizer from '@/components/image-resizer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

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
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> PROFESSIONAL STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Image <span className="text-gradient-hero">Resizer</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Exact pixel and mm resizing for government job forms and official documents.
                </p>
            </div>
            
            <ImageResizer />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Professional Image Resizer" steps={steps} />

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
            </section>
        </div>
    </main>
  );
}
