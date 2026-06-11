
import { Metadata } from 'next';
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
            <ImageToPdfConverter />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Advanced Image to PDF" steps={deepSteps} />
        </div>
    </main>
  );
}
