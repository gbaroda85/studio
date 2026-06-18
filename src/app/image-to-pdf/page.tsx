import { Metadata } from 'next';
import ImageToPdfConverter from '@/components/image-to-pdf-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles } from 'lucide-react';

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
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Image to PDF Studio
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Convert multiple images into a single professional PDF. 100% Private local mapping.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ImageToPdfConverter />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Advanced Image to PDF" steps={deepSteps} />
        </div>
    </main>
  );
}
