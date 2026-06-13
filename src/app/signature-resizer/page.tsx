import { Metadata } from 'next';
import SignatureResizer from '@/components/signature-resizer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles, Maximize, ShieldCheck, Zap, MousePointer2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professional Signature Resizer - Resize to CM, Pixel & 20KB Online',
  description: 'Resize signatures for SSC, UPSC, and Bank applications. Convert to exact Centimeters or Pixels with DPI control and strict KB limit. 100% Private local tool.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/signature-resizer' }
};

export default function SignatureResizerPage() {
  const steps = [
    {
        title: "Upload Signature",
        description: "Select a clear photo of your signature. Our engine initializes a high-fidelity canvas in your browser RAM.",
        icon: "UploadCloud"
    },
    {
        title: "Set Dimensions",
        description: "Choose between 'Centimeter' or 'Pixel'. Set the required Width, Height and DPI (Standard: 200).",
        icon: "Maximize"
    },
    {
        title: "Target Size Lock",
        description: "Specify the max file size (e.g., 20KB). Our algorithm iteratively compresses the output to hit the target strictly.",
        icon: "Target"
    },
    {
        title: "HD Export",
        description: "Click 'Resize Signature' to render. Download your perfectly sized and optimized signature file instantly.",
        icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> OFFICIAL PORTAL READY
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                    Signature <span className="text-gradient-hero">Resizer Pro</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Resize to exact CM or Pixel dimensions with 20KB limit for SSC, UPSC and IBPS forms. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <SignatureResizer />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Signature Resizer" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white">
                        Standard Portal Compliance
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Government job applications require strict adherence to dimensions and file sizes. Our <strong>Signature Studio</strong> ensures your file never gets rejected due to "Invalid Dimensions" or "Size Exceeded".
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-orange-500/50 transition-all">
                        <Maximize className="text-orange-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Unit Precision</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Switch between Centimeters for offline print specs or Pixels for digital portal requirements instantly.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Zap className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Smart 20KB Loop</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Our engine automatically runs multiple compression passes to find the best quality that fits under your KB limit.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Server Risk</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your signatures are your identity. We process everything in local RAM, ensuring they are never stored or seen by anyone.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
