import { Metadata } from 'next';
import { ImageIcon, Trophy } from 'lucide-react';
import PdfToImageConverter from '@/components/pdf-to-image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'High Quality PDF to Image Converter - Extract PDF Pages as HD JPG/PNG Online',
  description: 'Convert every page of your PDF into high-resolution JPG or PNG images. Features batch processing, ZIP download, and 300 DPI quality extraction. 100% private local tool.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/pdf-to-image' }
};

export default function PdfToImagePage() {
  const deepSteps = [
    {
      title: "Import PDF",
      description: "Upload your multi-page PDF. Our local engine instantly maps the internal structure and initializes a high-resolution render buffer in local RAM.",
      icon: "FileDigit"
    },
    {
      title: "Align & Frame",
      description: "Choose 'A4 Frame' or 'Raw Fit'. Use the studio panel to position content to the top, center, or bottom of each resulting image exactly.",
      icon: "Settings2"
    },
    {
      title: "HD 300DPI Render",
      description: "The engine renders every vector and font at 2.5x scale. This ensures text remains razor-sharp for professional printing or web use.",
      icon: "Sparkles"
    },
    {
      title: "Batch ZIP Save",
      description: "Download individual pages or click 'Extract All' to bundle all pages into an organized ZIP archive instantly. 100% private extraction.",
      icon: "MonitorCheck"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=pdf" label="Back to PDF Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> EXTRACTION STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    PDF to <span className="text-gradient-hero">Image HD</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Extract all pages from a PDF as high-resolution JPG or PNG images.
                </p>
            </div>
            
            <PdfToImageConverter />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="PDF to Image HD Studio" steps={deepSteps} />
        </div>
    </main>
  );
}
