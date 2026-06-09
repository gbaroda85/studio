import { Metadata } from 'next';
import { PenLine, Trophy } from 'lucide-react';
import SignatureRemover from '@/components/signature-remover';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Signature Background Remover - Extract Clean PNG Signatures Online',
  description: 'Extract clean, transparent signatures from photos instantly. Remove paper backgrounds and shadows locally for digital signing. 100% private.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/remove-signature' }
};

export const dynamic = 'force-dynamic';

export default function RemoveSignaturePage() {
  const deepSteps = [
    {
      title: "Raw Photo Capture",
      description: "Take a clear photo of your signature on white paper. Our engine initializes a pixel-level histogram to prepare for background subtraction.",
      icon: "UploadCloud"
    },
    {
      title: "Chroma Extraction",
      description: "Click 'Start Cleaning'. The tool uses advanced color-distance algorithms to isolate ink from paper textures and uneven lighting.",
      icon: "Eraser"
    },
    {
      title: "Visual Fine-Tuning",
      description: "Use the 'Sensitivity' slider to remove stubborn shadows. Use 'Ink Darkness' to ensure the signature is bold and digital-ready.",
      icon: "ArrowLeftRight"
    },
    {
      title: "Transparent Save",
      description: "Click 'Download PNG'. Your signature is saved with a true alpha channel (Transparent), ready to be placed on any PDF or form.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> IDENTITY STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Signature <span className="text-gradient-hero">Remover</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    Extract clean, transparent signatures from photos for digital form submissions.
                </p>
            </div>
            
            <SignatureRemover />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Signature Background Remover" steps={deepSteps} />
        </div>
    </main>
  );
}
