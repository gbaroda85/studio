
import { Metadata } from 'next';
import PdfToImageConverter from '@/components/pdf-to-image-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'High Quality PDF to Image Converter - Extract PDF Pages as HD JPG/PNG Online',
  description: 'Convert every page of your PDF into high-resolution JPG or PNG images. Features batch processing, ZIP download, and 300 DPI quality extraction. 100% private local tool.',
  alternates: { canonical: '/pdf-to-image' }
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
            <PdfToImageConverter />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="PDF to Image HD Studio" steps={deepSteps} />
        </div>
    </main>
  );
}
