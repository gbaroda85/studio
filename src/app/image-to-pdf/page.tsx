import { Metadata } from 'next';
import { Layout, Download, RotateCw, UploadCloud, Trophy } from 'lucide-react';
import ImageToPdfConverter from '@/components/image-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Image to PDF Converter - Convert Multiple Photos with Layout Control Online',
  description: 'Convert JPG, PNG, and WEBP to PDF with Top, Center, and Bottom alignment. Professional tool to bundle photos into a high-quality A4 PDF document instantly.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-to-pdf' }
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
      icon: "Layout"
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
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> BUNDLE STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Image to <span className="text-gradient-hero">PDF Converter</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Convert multiple photos into a high-quality A4 PDF with layout control.
                </p>
            </div>
            
            <ImageToPdfConverter />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Advanced Image to PDF" steps={deepSteps} />
        </div>
    </main>
  );
}
