import { Metadata } from 'next';
import ImageToTextConverter from '@/components/image-to-text-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Image to Text (OCR) - Extract Text from Photos Online Securely',
  description: 'Smart local OCR tool to extract text from documents, screenshots, and notes. Supports English and Hindi with 100% privacy.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/image-to-text' }
};

export default function ImageToTextPage() {
  const deepSteps = [
    {
      title: "Upload Photo",
      description: "Select any document or image. Our engine samples the image at high DPI in local RAM to ensure small fonts are clearly readable for extraction.",
      icon: "UploadCloud"
    },
    {
      title: "AI Analysis",
      description: "Click 'Extract Text'. Gemini 2.5 Flash performs a multi-layer semantic scan to understand characters, symbols, and formatting with 99% accuracy.",
      icon: "BrainCircuit"
    },
    {
      title: "Semantic Capture",
      description: "The AI recognizes and reconstructs the text while preserving line breaks and original layout. Native support for English and Hindi scripts.",
      icon: "FileText"
    },
    {
      title: "Export & Save",
      description: "Text appears instantly in our Studio Editor. Use 'Copy' to move data to your clipboard. All processing is 100% private and secure.",
      icon: "Clipboard"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <ImageToTextConverter />
        </div>
        
        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Smart Image to Text (OCR)" steps={deepSteps} />
        </div>
    </main>
  );
}
