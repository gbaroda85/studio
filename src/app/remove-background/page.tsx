import { Metadata } from 'next';
import { Cpu, Trophy } from 'lucide-react';
import { BackgroundRemoverClient } from '@/components/client-tool-wrappers';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';

export const metadata: Metadata = {
  title: 'Background Remover - High-Precision AI Image Extraction Online',
  description: 'Pro-grade background removal using local AI technology. Perfect for hair detection, edge precision, and transparent PNG export. 100% private local RAM processing.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/remove-background' }
};

export const dynamic = 'force-dynamic';

export default function RemoveBackgroundPage() {
  const deepSteps = [
    {
      title: "Neural Import",
      description: "Upload your photo. Our local engine initializes the neural weights in your browser RAM, ensuring zero data leaves your device.",
      icon: "UploadCloud"
    },
    {
      title: "Segmentation Stage",
      description: "Click 'Remove Background'. The AI analyzes every pixel with edge-aware convolution, specifically optimizing for complex hair and textures.",
      icon: "Wand2"
    },
    {
      title: "Visual Audit",
      description: "Use the Comparison Slider to check the edge quality. Our studio renders a 300DPI mask that preserves the original image resolution perfectly.",
      icon: "ArrowLeftRight"
    },
    {
      title: "Industrial Export",
      description: "Choose a solid background or keep it transparent. Click 'Download PNG' to save your HD sanitized asset, ready for professional use.",
      icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center pt-4 md:pt-8">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Trophy className="size-3" /> NEURAL STUDIO
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                    Background <span className="text-gradient-hero">Remover</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-sm md:text-base">
                    High-precision AI subject isolation with local GPU acceleration.
                </p>
            </div>
            
            <BackgroundRemoverClient />
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Background Remover" steps={deepSteps} />
        </div>
    </main>
  );
}
