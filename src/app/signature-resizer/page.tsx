import { Metadata } from 'next';
import SignatureResizer from '@/components/signature-resizer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles, Maximize, ShieldCheck, Zap, MousePointer2, X, ChevronDown } from 'lucide-react';

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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Signature Resizer
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-[10px] md:text-xs">
                    Resize to exact CM or Pixel dimensions with 20KB limit for SSC, UPSC and IBPS forms. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <SignatureResizer />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="Signature Resizer" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white">
                        Standard Portal Compliance
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Government job applications require strict adherence to dimensions and file sizes. Our <strong>Signature Studio</strong> ensures your file never gets rejected due to "Invalid Dimensions" or "Size Exceeded".
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-cyan-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <Maximize className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">UNIT PRECISION</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Switch between Centimeters for offline print specs or Pixels for digital portal requirements instantly.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Zap className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">SMART 20KB LOOP</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Our engine automatically runs multiple compression passes to find the best quality that fits under your KB limit.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO SERVER RISK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80 text-center">Your signatures are your identity. We process everything in local RAM, ensuring they are never stored or seen by anyone.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
