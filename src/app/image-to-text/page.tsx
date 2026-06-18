import { Metadata } from 'next';
import ImageToTextConverter from '@/components/image-to-text-converter';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles } from 'lucide-react';

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
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Image to Text (OCR)
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-xl mx-auto text-xs md:text-sm">
                    Extract text from documents and images locally. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ImageToTextConverter />
            </div>
        </div>
        
        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Smart Image to Text (OCR)" steps={deepSteps} />
        </div>
    </main>
  );
}
