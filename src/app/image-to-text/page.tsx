import { Metadata } from 'next';
import { SearchCode, Trophy } from 'lucide-react';
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
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> INTELLIGENCE STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Image to <span className="text-gradient-hero">Text (OCR)</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Extract text from documents, screenshots, and notes with high AI accuracy.
                </p>
            </div>
            
            <ImageToTextConverter />
        </div>
        
        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Smart Image to Text (OCR)" steps={deepSteps} />
        </div>
    </main>
  );
}
