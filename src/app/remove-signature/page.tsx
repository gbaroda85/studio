import { Metadata } from 'next';
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
    <main className="flex-1 flex flex-col items-center pt-16 md:pt-20">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <SignatureRemover />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Signature Background Remover" steps={deepSteps} />
        </div>
    </main>
  );
}
